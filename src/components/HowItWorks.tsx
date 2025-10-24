import { motion } from 'framer-motion';
import { UserPlus, Search, CheckCircle, Rocket } from 'lucide-react';

const steps = [
  {
    icon: UserPlus,
    title: 'Create Your Profile',
    description: 'Sign up and complete your profile with verification from KUCCPS.',
    step: '01',
  },
  {
    icon: Search,
    title: 'Browse & Match',
    description: 'Explore opportunities or post requirements based on your needs.',
    step: '02',
  },
  {
    icon: CheckCircle,
    title: 'Connect & Approve',
    description: 'Review applications, get approved, and finalize arrangements.',
    step: '03',
  },
  {
    icon: Rocket,
    title: 'Start Teaching',
    description: 'Begin your educational journey and make a real impact.',
    step: '04',
  },
];

const HowItWorks = () => {
  return (
    <section id="how-it-works" className="py-24">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl lg:text-5xl font-bold">
            How{' '}
            <span className="bg-gradient-secondary bg-clip-text text-transparent">
              It Works
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Get started in four simple steps and begin making a difference
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 relative">
          {/* Connecting Line (Desktop) */}
          <div className="hidden lg:block absolute top-16 left-0 right-0 h-0.5 bg-gradient-to-r from-primary via-secondary to-success opacity-20" />

          {steps.map((step, index) => (
            <motion.div
              key={step.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="relative"
            >
              <div className="text-center space-y-4">
                {/* Step Number */}
                <div className="relative inline-flex">
                  <div className="absolute inset-0 bg-gradient-primary rounded-full blur-xl opacity-30" />
                  <div className="relative bg-card border-2 border-primary rounded-full h-16 w-16 flex items-center justify-center mx-auto shadow-elevation-medium">
                    <step.icon className="h-8 w-8 text-primary" />
                  </div>
                  <div className="absolute -top-2 -right-2 bg-secondary text-secondary-foreground rounded-full h-8 w-8 flex items-center justify-center text-xs font-bold shadow-elevation-low">
                    {step.step}
                  </div>
                </div>

                <h3 className="text-xl font-bold">{step.title}</h3>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default HowItWorks;
