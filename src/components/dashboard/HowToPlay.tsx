
import React, { useState } from 'react';
import { Shield, ArrowRight, ChevronRight, Gift, Trophy, Percent, ChevronDown, Info, HelpCircle } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';

const HowToPlay: React.FC = () => {
  const [expanded, setExpanded] = useState(false);
  
  const steps = [
    { 
      icon: <Trophy className="h-5 w-5 text-betster-400" />,
      title: "Choose a Game Type",
      description: "Select a game type and pool based on your preferred entry fee",
      detail: "Browse through our selection of games, each with different mechanics and prize pools. You can filter games by difficulty, stake amount, and more to find ones that match your style.",
      badge: { text: "Step 1", variant: "betster" as const }
    },
    { 
      icon: <Shield className="h-5 w-5 text-betster-400" />,
      title: "Pick Your Number",
      description: "The goal is to pick a number that few others will select",
      detail: "Think strategically! Look at the trending numbers section to see which numbers are commonly chosen. The least picked numbers have the best chance of winning.",
      badge: { text: "Step 2", variant: "betster" as const }
    },
    { 
      icon: <ChevronRight className="h-5 w-5 text-betster-400" />,
      title: "Wait for Results",
      description: "Wait for the timer to end and see which numbers were least picked",
      detail: "Once the timer runs out, our system calculates which numbers were chosen the least. This is completely transparent and verifiable on the blockchain.",
      badge: { text: "Step 3", variant: "betster" as const }
    },
    { 
      icon: <Gift className="h-5 w-5 text-betster-400" />,
      title: "Win Prizes",
      description: "The least picked numbers win prizes from the pool!",
      detail: "If your number is among the least chosen, you win a share of the prize pool. The fewer people who picked your number, the bigger your share of the winnings.",
      badge: { text: "Step 4", variant: "betster" as const },
      highlight: true
    },
    { 
      icon: <Percent className="h-5 w-5 text-betster-400" />,
      title: "Earn Bonuses",
      description: "Play more games to earn milestone bonuses (5-30% based on games played)",
      detail: "The more you play, the more bonuses you unlock. These bonuses increase your winnings by a percentage, making each victory more valuable as you continue playing.",
      badge: { text: "Step 5", variant: "betster" as const }
    }
  ];

  const faqs = [
    {
      question: "Is this gambling?",
      answer: "No, this is a game of skill and strategy. You need to predict which numbers will be less popular among other players, making it a game of psychological strategy rather than chance.",
      badge: "Strategy"
    },
    {
      question: "How are winners determined?",
      answer: "Winners are determined by selecting players who chose the least picked numbers. If multiple players chose the same number, they share the prize for that position.",
      badge: "Rules"
    },
    {
      question: "Can I play multiple games at once?",
      answer: "Yes, you can join multiple game pools at the same time, as long as you have enough balance in your wallet to cover the entry fees.",
      badge: "Gameplay"
    },
    {
      question: "How do I withdraw my winnings?",
      answer: "Winnings are automatically credited to your wallet balance. You can withdraw them anytime through the wallet section.",
      badge: "Payments"
    }
  ];

  const container = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const item = {
    hidden: { opacity: 0, y: 10 },
    show: { opacity: 1, y: 0 }
  };

  return (
    <motion.div 
      className="mt-8 p-6 bg-black/30 backdrop-blur-sm rounded-xl border border-betster-700/30"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      <div className="flex items-center justify-between mb-5">
        <div className="flex items-center space-x-3">
          <HelpCircle className="h-5 w-5 text-betster-400" />
          <h2 className="font-semibold text-white text-xl">How to Play</h2>
          <Badge variant="premium" className="ml-2">Pro Tips</Badge>
        </div>
        <Button 
          variant="ghost" 
          size="sm"
          onClick={() => setExpanded(!expanded)}
          className="text-betster-300 hover:text-betster-100 h-8 gap-1.5"
        >
          {expanded ? "Show Less" : "Show More"}
          <ChevronDown className={`h-4 w-4 transform transition-transform ${expanded ? 'rotate-180' : ''}`} />
        </Button>
      </div>
      
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4"
        variants={container}
        initial="hidden"
        animate="show"
      >
        {steps.map((step, index) => (
          <motion.div 
            key={index}
            variants={item}
            className={`flex items-start space-x-3 p-4 rounded-lg border transition-colors ${
              step.highlight 
                ? "bg-gradient-to-br from-betster-900/50 to-betster-800/50 border-betster-600/40" 
                : "bg-betster-900/30 border-betster-700/20 group hover:border-betster-600/40"
            }`}
            whileHover={{ y: -5, transition: { duration: 0.2 } }}
          >
            <div className={`flex-shrink-0 rounded-full p-2 ${
              step.highlight 
                ? "bg-betster-700/70" 
                : "bg-betster-800/50 group-hover:bg-betster-700/70"
            } transition-colors`}>
              {step.icon}
            </div>
            <div>
              <div className="flex items-center">
                <h3 className="text-betster-100 font-medium">{step.title}</h3>
                {step.badge && (
                  <Badge variant={step.badge.variant} size="sm" className="ml-2">
                    {step.badge.text}
                  </Badge>
                )}
              </div>
              <p className="text-sm text-betster-300 mt-1">{step.description}</p>
              <AnimatePresence>
                {expanded && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: "auto" }}
                    exit={{ opacity: 0, height: 0 }}
                    className="overflow-hidden"
                  >
                    <p className="text-xs text-betster-400 mt-2 border-t border-betster-700/20 pt-2">
                      {step.detail}
                    </p>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </motion.div>
        ))}
      </motion.div>
      
      <AnimatePresence>
        {expanded && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="mt-6"
          >
            <div className="border-t border-betster-700/20 pt-4">
              <div className="flex items-center mb-4">
                <Info className="h-5 w-5 text-betster-400 mr-2" />
                <h3 className="text-betster-100 font-medium">Frequently Asked Questions</h3>
              </div>
              
              <Accordion type="single" collapsible className="w-full">
                {faqs.map((faq, index) => (
                  <AccordionItem key={index} value={`faq-${index}`}>
                    <AccordionTrigger className="text-sm text-betster-200 hover:text-betster-100">
                      <div className="flex items-center">
                        {faq.question}
                        <Badge variant="betsterOutline" size="sm" className="ml-2">
                          {faq.badge}
                        </Badge>
                      </div>
                    </AccordionTrigger>
                    <AccordionContent className="text-sm text-betster-300">
                      {faq.answer}
                    </AccordionContent>
                  </AccordionItem>
                ))}
              </Accordion>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      
      <motion.div 
        className="mt-5 p-4 bg-gradient-to-r from-betster-800/40 to-betster-700/20 rounded-lg"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.5 }}
      >
        <p className="text-sm text-betster-200 flex items-center">
          <Trophy className="h-4 w-4 mr-2 text-yellow-500" />
          <span>Tip: Refer friends to earn 5% of their first deposit!</span>
          <Badge variant="success" size="sm" className="mx-2">New</Badge>
          <ArrowRight className="h-4 w-4 ml-2 text-betster-400" />
        </p>
      </motion.div>
    </motion.div>
  );
};

export default HowToPlay;
