import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Link } from 'react-router-dom';
import studentIcon from '@/assets/student-icon.png';
import schoolIcon from '@/assets/school-icon.png';
import officerIcon from '@/assets/officer-icon.png';

const roles = [
  {
    icon: studentIcon,
    title: 'For Students',
    description: 'Find teaching opportunities, gain experience, and make a difference in CBC schools.',
    features: [
      'Browse available positions',
      'Track your applications',
      'Earn while learning',
      'Build your resume',
    ],
    gradient: 'from-primary to-primary-glow',
  },
  {
    icon: schoolIcon,
    title: 'For Schools',
    description: 'Connect with qualified university students to support your CBC curriculum.',
    features: [
      'Post requirements',
      'Review applications',
      'Manage placements',
      'Access qualified talent',
    ],
    gradient: 'from-secondary to-secondary-glow',
  },
  {
    icon: officerIcon,
    title: 'For Education Officers',
    description: 'Oversee, approve, and monitor educational partnerships across your region.',
    features: [
      'Comprehensive analytics',
      'Approval workflows',
      'Performance tracking',
      'Generate reports',
    ],
    gradient: 'from-success to-primary',
  },
];

const Roles = () => {
  return (
    <section id="roles" className="py-24 bg-muted/30">
      <div className="container mx-auto px-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="text-center mb-16 space-y-4"
        >
          <h2 className="text-4xl lg:text-5xl font-bold">
            Built for{' '}
            <span className="bg-gradient-primary bg-clip-text text-transparent">
              Your Role
            </span>
          </h2>
          <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
            Tailored experiences for students, schools, and education officers
          </p>
        </motion.div>

        <div className="grid md:grid-cols-3 gap-8">
          {roles.map((role, index) => (
            <motion.div
              key={role.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: index * 0.15 }}
              className="group relative bg-card rounded-2xl shadow-elevation-medium hover:shadow-elevation-high transition-smooth border border-border overflow-hidden"
            >
              {/* Gradient Background */}
              <div className={`absolute inset-0 bg-gradient-to-br ${role.gradient} opacity-5 group-hover:opacity-10 transition-smooth`} />

              <div className="relative p-8 space-y-6">
                {/* Icon */}
                <div className="relative">
                  <div className="w-20 h-20 rounded-xl overflow-hidden shadow-elevation-low">
                    <img src={role.icon} alt={role.title} className="w-full h-full object-cover" />
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="text-2xl font-bold">{role.title}</h3>
                  <p className="text-muted-foreground">{role.description}</p>
                </div>

                {/* Features List */}
                <ul className="space-y-2">
                  {role.features.map((feature) => (
                    <li key={feature} className="flex items-center gap-2 text-sm">
                      <div className="h-1.5 w-1.5 rounded-full bg-primary" />
                      <span className="text-muted-foreground">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* CTA Button */}
                <Link to="/auth">
                  <Button variant="outline" className="w-full group-hover:bg-primary group-hover:text-primary-foreground transition-smooth">
                    Get Started
                  </Button>
                </Link>
              </div>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
};

export default Roles;
