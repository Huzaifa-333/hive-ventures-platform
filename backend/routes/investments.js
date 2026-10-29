const express = require('express');
const Investment = require('../models/Investment');
const Property = require('../models/Property');
const auth = require('../middleware/auth');

const router = express.Router();

// Make an investment
router.post('/invest', auth, async (req, res) => {
  try {
    const { propertyId, amount } = req.body;
    const property = await Property.findById(propertyId);
    
    if (!property) return res.status(404).json({ message: 'Property not found' });
    if (property.status !== 'Available') return res.status(400).json({ message: 'Property not available' });
    
    const sharePrice = property.price / property.totalShares;
    const sharesBought = amount / sharePrice;
    const sharePercentage = (sharesBought / property.totalShares) * 100;
    
    // Check if enough shares available
    if (sharesBought > property.availableShares) {
      return res.status(400).json({ message: `Only ${property.availableShares} shares available ($${(property.availableShares * sharePrice).toLocaleString()})` });
    }
    
     // Update available shares
    property.availableShares -= sharesBought;

     // Auto-mark as Sold if no shares left
     if (property.availableShares <= 0) {
    property.status = 'Sold';
    }

     await property.save();
    
    const investment = new Investment({
      investorId: req.user.id,
      investorName: req.user.username,
      propertyId: property._id,
      propertyName: property.title,
      amount: amount,
      sharePercentage: sharePercentage,
      sharesBought: sharesBought,
      chequeIssued: true,
      chequeNumber: 'CHQ' + Date.now()
    });
    
    await investment.save();
    res.status(201).json({ message: 'Investment successful', investment });
  } catch (error) {
    res.status(500).json({ message: 'Server error', error: error.message });
  }
});

 
 // Get all investments (admin only) — includes withdrawn, recalculates profit from currentValue
 // Get all investments (admin only) — includes withdrawn
router.get('/all', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ error: 'Admin access required' });
    }

    // Get ALL investments (including withdrawn)
    const investments = await Investment.find().sort({ investmentDate: -1 });

    // Calculate profit/loss for each investment
    const investmentsWithDetails = await Promise.all(investments.map(async (inv) => {
      const property = await Property.findById(inv.propertyId);
      const originalPrice = property?.price || inv.amount;
      const currentValue = (property?.currentValue && property.currentValue > 0) ? property.currentValue : originalPrice;
      
      let investorShare = 0;
      let hiveShare = 0;
      let returnAmount = inv.amount;
      
      // Withdrawn — still calculate and show what profit/loss was at time of withdrawal
// This preserves the historical record for admin reporting
if (inv.status === 'withdrawn') {
  returnAmount = inv.amount;
  // Still calculate profit/loss based on property value — shows what happened
  const totalProfitLoss = currentValue - originalPrice;
  const investorProfitLoss = totalProfitLoss * (inv.sharePercentage / 100);

  if (totalProfitLoss > 0) {
    // Profit was made — show it even though withdrawn
    investorShare = investorProfitLoss * 0.75;
    hiveShare = investorProfitLoss * 0.25;
  } else if (totalProfitLoss < 0) {
    // Loss occurred — Hive bore this loss, show it
    investorShare = 0;
    hiveShare = investorProfitLoss; // negative value stays
  } else {
    investorShare = 0;
    hiveShare = 0;
  }
}
      else {
        // Calculate profit/loss for active investments
        const totalProfitLoss = currentValue - originalPrice;
        const investorProfitLoss = totalProfitLoss * (inv.sharePercentage / 100);
        
        if (totalProfitLoss > 0) {
          // Profit case: investor gets 75%
          investorShare = investorProfitLoss * 0.75;
          hiveShare = investorProfitLoss * 0.25;
        } else if (totalProfitLoss < 0) {
          // Loss case: Hive bears 100% loss, investor gets full original amount
          investorShare = 0;
          hiveShare = investorProfitLoss; // Negative value (loss)
        } else {
          investorShare = 0;
          hiveShare = 0;
        }
      }
      
      return {
        ...inv._doc,
        currentValue,
        investorShare: Math.round(investorShare),
        hiveShare: Math.round(hiveShare),
        returnAmount
      };
    }));

    res.json(investmentsWithDetails);
  } catch (error) {
    console.log('Error:', error);
    res.status(500).json([]);
  }
});


// Get my investments
router.get('/my-investments', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ investorId: req.user.id });
    res.json(investments);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get my investments with profit calculation
// This endpoint simulates profit calculation and shows potential returns
// In investor dashboard, use property's currentValue for profit calculation
 
router.get('/my-investments-details', auth, async (req, res) => {
  try {
    const investments = await Investment.find({ investorId: req.user.id });
    
    const investmentsWithProfit = await Promise.all(investments.map(async (inv) => {
      // Fetch latest property to get updated currentValue set by admin
      const property = await Property.findById(inv.propertyId);
      
      // currentValue is what admin sets — falls back to original amount if not set
      const currentValue = (property?.currentValue && property.currentValue > 0) 
        ? property.currentValue 
        : inv.amount;
      
      // Profit = (currentValue - originalPrice) × investor's share percentage
      const totalPropertyProfit = currentValue - (property?.price || inv.amount);
      const investorProfit = totalPropertyProfit > 0 
        ? (totalPropertyProfit * (inv.sharePercentage / 100)) * 0.75 
        : 0;
      
      return {
        ...inv._doc,
        currentValue: currentValue,
        profitAmount: investorProfit > 0 ? investorProfit : 0,
       investorShare: Math.round(investorProfit), // investor gets 75% of their share profit
       hiveShare: Math.round(investorProfit * 0.333), // hive gets 25%
        withdrawalAvailable: new Date(inv.investmentDate).setFullYear(
          new Date().getFullYear() + 1
        ) <= Date.now()
      };
    }));
    
    res.json(investmentsWithProfit);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Withdraw investment
router.post('/withdraw/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, investorId: req.user.id });
    if (!investment) return res.status(404).json({ message: 'Investment not found' });
    
    if (investment.status === 'withdrawn') {
      return res.status(400).json({ message: 'Already withdrawn' });
    }
    
    const property = await Property.findById(investment.propertyId);
    const oneYearPassed = new Date(investment.investmentDate).setFullYear(new Date().getFullYear() + 1) <= Date.now();
    let returnAmount = investment.amount;
    let lossAmount = 0;
    
    if (!oneYearPassed) {
      returnAmount = investment.amount;
    } else {
      const totalProfitLoss = (property?.currentValue || property.price) - property.price;
      
      if (totalProfitLoss < 0) {
        // Loss scenario: investor gets original amount, Hive bears loss
        returnAmount = investment.amount;
        lossAmount = Math.abs(totalProfitLoss) * (investment.sharePercentage / 100);
      } else {
        // Profit scenario
        const profit = investment.amount * 0.15;
        returnAmount = investment.amount + (profit * 0.75);
      }
    }
    
    // Restore shares to property
    if (property) {
      const sharePrice = property.price / property.totalShares;
      const sharesToRestore = investment.amount / sharePrice;
      property.availableShares += sharesToRestore;
      if (property.status === 'Sold' && property.availableShares > 0) {
        property.status = 'Available';
      }
      await property.save();
    }
    
    investment.status = 'withdrawn';
    investment.exitDate = new Date();
    investment.profitAmount = lossAmount > 0 ? -lossAmount : 0;
    await investment.save();
    
    res.json({ message: 'Withdrawal successful', amount: returnAmount, loss: lossAmount });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


// Delete investment (only allow deletion of withdrawn investments)
router.delete('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, investorId: req.user.id });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    
    // Prevent deletion of active investments
    if (investment.status !== 'withdrawn') {
      return res.status(400).json({ message: 'To delete an active investment, you must withdraw it first' });
    }
    
    await Investment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Investment deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});

// Get single investment by ID  cheque
router.get('/:id', auth, async (req, res) => {
  try {
    const investment = await Investment.findOne({ _id: req.params.id, investorId: req.user.id });
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }
    res.json(investment);
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});



// Delete investment by admin — restores shares to property before deleting
router.delete('/admin/:id', auth, async (req, res) => {
  try {
    if (req.user.role !== 'admin') {
      return res.status(403).json({ message: 'Admin access required' });
    }

    // Find the investment first to get share data before deleting
    const investment = await Investment.findById(req.params.id);
    if (!investment) {
      return res.status(404).json({ message: 'Investment not found' });
    }

    // Only restore shares if investment is still active — withdrawn ones already restored shares on withdrawal
    if (investment.status !== 'withdrawn') {
      const property = await Property.findById(investment.propertyId);
      if (property) {
        const sharePrice = property.price / property.totalShares;
        const sharesToRestore = investment.amount / sharePrice;
        property.availableShares += sharesToRestore;

        // If property was Sold and shares are now available again, mark as Available
        if (property.status === 'Sold' && property.availableShares > 0) {
          property.status = 'Available';
        }
        await property.save();
      }
    }

    await Investment.findByIdAndDelete(req.params.id);
    res.json({ message: 'Investment deleted and shares restored' });
  } catch (error) {
    res.status(500).json({ message: 'Server error' });
  }
});


module.exports = router;