import { Router } from 'express';
import { smartAssistant, generatePayrollInsights } from '../services/geminiService';

const router = Router();

router.post('/chat', async (req, res) => {
  const { query, context } = req.body;
  try {
    const response = await smartAssistant(query, context);
    res.json({ response });
  } catch (error) {
    res.status(500).json({ message: "AI Assistant failed to respond" });
  }
});

router.post('/insights', async (req, res) => {
  const { payrollData } = req.body;
  try {
    const insights = await generatePayrollInsights(payrollData);
    res.json({ insights });
  } catch (error) {
    res.status(500).json({ message: "Failed to generate insights" });
  }
});

export default router;
