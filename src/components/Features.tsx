import { motion } from 'framer-motion';
import { Users, MapPin, Shield, Zap, BarChart3, Bell } from 'lucide-react';

const features = [
  {
    icon: Users,
    title: 'Smart Matching',
    description: 'AI-powered algorithm matches students with schools based on skills, location, and preferences.',
    color: 'text-primary',
  },
  {
    icon: MapPin,
    title: 'Location-Based',
    description: 'Find opportunities near you with integrated Google Maps distance calculation.',
    color: 'text-secondary',
  },
  {
    icon: Shield,
    title: 'Verified Profiles',
    description: 'KUCCPS verification ensures all students are legitimate university enrollees.',
    color: 'text-success',
  },
  {
    icon: Zap,
    title: 'Real-time Updates',
    description: 'Instant notifications for applications, approvals, and important updates.',
    color: 'text-primary',
  },
  {
    icon: BarChart3,
    title: 'Analytics Dashboard',
    description: 'Comprehensive insights and reporting for education officers and administrators.',
    color: 'text-secondary',
  },
  {
    icon: Bell,
    title: 'Notifications',
    description: 'Stay informed with real-time alerts for every stage of the matching process.',
    color: 'text-success',
  },
];

const Features = () => {
  return (
    <section id="features" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl lg:text-5xl font-bold">
            Powerful Features for{' '}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Everyone
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Everything you need to connect, manage, and track educational partnerships
          </p>
        </motion.div>

        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <motion.div
              key={feature.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.1 }}
              className="group relative bg-card p-6 rounded-xl shadow-elevation-low hover:shadow-elevation-high transition-smooth border border-border hover:border-primary/50"
            >
              <div className={`inline-flex p-3 rounded-lg bg-gradient-primary mb-4`}>
                <feature.icon className="h-6 w-6 text-primary-foreground" />
              </div>
              <h3 className="text-xl font-bold mb-2">{feature.title}</h3>
              <p className="text-muted-foreground">{feature.description}</p>

              {/* Hover Effect */}
              <div className="absolute inset-0 rounded-xl bg-gradient-primary opacity-0 group-hover:opacity-5 transition-smooth pointer-events-none" />
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Features;
