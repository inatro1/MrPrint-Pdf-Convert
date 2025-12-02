const express = require('express');
const router = express.Router();
const User = require('./models/User');
const jwt = require('jsonwebtoken');

router.post('/register', async (req,res)=>{
  try{
    const { email, password, name } = req.body;
    if(!email || !password) return res.status(400).json({ error: 'Email e password obrigatórios' });
    let user = await User.findOne({ email });
    if(user) return res.status(400).json({ error: 'Email já registado' });
    user = new User({ email, name });
    await user.setPassword(password);
    await user.save();
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name }});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

router.post('/login', async (req,res)=>{
  try{
    const { email, password } = req.body;
    const user = await User.findOne({ email });
    if(!user) return res.status(400).json({ error: 'Credenciais inválidas' });
    const ok = await user.validatePassword(password);
    if(!ok) return res.status(400).json({ error: 'Credenciais inválidas' });
    const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: process.env.JWT_EXPIRES_IN || '7d' });
    res.json({ token, user: { id: user._id, email: user.email, name: user.name }});
  }catch(err){
    console.error(err);
    res.status(500).json({ error: 'Erro no servidor' });
  }
});

module.exports = router;
