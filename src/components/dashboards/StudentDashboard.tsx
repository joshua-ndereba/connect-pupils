import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LogOut, GraduationCap, Briefcase, CheckCircle, Clock, MapPin } from 'lucide-react';
import { toast } from 'sonner';

const StudentDashboard = () => {
  const [user, setUser] = useState<any>(null);
  const [profile, setProfile] = useState<any>(null);
  const [postings, setPostings] = useState<any[]>([]);
  const [applications, setApplications] = useState<any[]>([]);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUserData();
    fetchPostings();
    fetchApplications();

    // Subscribe to real-time updates
    const applicationsSubscription = supabase
      .channel('student-applications')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'applications'
      }, () => {
        fetchApplications();
      })
      .subscribe();

    return () => {
      applicationsSubscription.unsubscribe();
    };
  }, []);

  async function fetchUserData() {
    const { data: { user } } = await supabase.auth.getUser();
    setUser(user);

    if (user) {
      const { data: profileData } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
      
      setProfile(profileData);
    }
  }

  async function fetchPostings() {
    const { data, error } = await supabase
      .from('school_postings')
      .select(`
        *,
        schools (
          school_name,
          location
        )
      `)
      .eq('status', 'open')
      .order('created_at', { ascending: false })
      .limit(6);

    if (!error && data) {
      setPostings(data);
    }
  }

  async function fetchApplications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: studentData } = await supabase
      .from('students')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (studentData) {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          school_postings (
            title,
            schools (
              school_name
            )
          )
        `)
        .eq('student_id', studentData.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setApplications(data);
      }
    }
  }

  async function handleSignOut() {
    await supabase.auth.signOut();
    navigate('/');
  }

  const stats = [
    { label: 'Applications', value: applications.length, icon: Briefcase, color: 'text-primary' },
    { label: 'Pending', value: applications.filter(a => a.status === 'pending').length, icon: Clock, color: 'text-secondary' },
    { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, icon: CheckCircle, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-elevation-low sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-primary rounded-lg p-2">
                <GraduationCap className="h-6 w-6 text-primary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">Student Dashboard</h1>
                <p className="text-sm text-muted-foreground">{profile?.email}</p>
              </div>
            </div>
            <Button variant="outline" onClick={handleSignOut}>
              <LogOut className="h-4 w-4 mr-2" />
              Sign Out
            </Button>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        {/* Welcome Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="mb-8"
        >
          <h2 className="text-3xl font-bold mb-2">Welcome back, {profile?.full_name}!</h2>
          <p className="text-muted-foreground">Find teaching opportunities and track your applications</p>
        </motion.div>

        {/* Stats Grid */}
        <div className="grid md:grid-cols-3 gap-6 mb-8">
          {stats.map((stat, index) => (
            <motion.div
              key={stat.label}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: index * 0.1 }}
            >
              <Card className="p-6 hover:shadow-elevation-medium transition-smooth">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground mb-1">{stat.label}</p>
                    <p className="text-3xl font-bold">{stat.value}</p>
                  </div>
                  <div className={`p-3 rounded-lg bg-gradient-primary`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Available Opportunities */}
        <section className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-2xl font-bold">Available Opportunities</h3>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {postings.map((posting, index) => (
              <motion.div
                key={posting.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card className="p-6 hover:shadow-elevation-high transition-smooth h-full flex flex-col">
                  <div className="flex-1">
                    <h4 className="text-lg font-bold mb-2">{posting.title}</h4>
                    <div className="flex items-center gap-2 text-sm text-muted-foreground mb-3">
                      <MapPin className="h-4 w-4" />
                      <span>{posting.schools?.school_name}</span>
                    </div>
                    <p className="text-sm text-muted-foreground mb-4 line-clamp-2">{posting.description}</p>
                    <div className="space-y-2 text-sm">
                      <p><span className="font-semibold">Subject:</span> {posting.subject_area}</p>
                      <p><span className="font-semibold">Duration:</span> {posting.duration_weeks} weeks</p>
                      {posting.stipend_amount && (
                        <p><span className="font-semibold">Stipend:</span> KES {posting.stipend_amount?.toLocaleString()}</p>
                      )}
                    </div>
                  </div>
                  <Button variant="default" className="w-full mt-4">
                    Apply Now
                  </Button>
                </Card>
              </motion.div>
            ))}
          </div>
        </section>

        {/* My Applications */}
        <section>
          <h3 className="text-2xl font-bold mb-4">My Applications</h3>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">You haven't submitted any applications yet</p>
              </Card>
            ) : (
              applications.map((application) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="p-6 hover:shadow-elevation-medium transition-smooth">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-1">{application.school_postings?.title}</h4>
                        <p className="text-sm text-muted-foreground">{application.school_postings?.schools?.school_name}</p>
                      </div>
                      <div className="text-right">
                        <span className={`inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium
                          ${application.status === 'approved' ? 'bg-success/10 text-success' :
                            application.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                            'bg-secondary/10 text-secondary'}`}>
                          {application.status === 'approved' && <CheckCircle className="h-4 w-4" />}
                          {application.status === 'pending' && <Clock className="h-4 w-4" />}
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                      </div>
                    </div>
                  </Card>
                </motion.div>
              ))
            )}
          </div>
        </section>
      </main>
    </div>
  );
};

export default StudentDashboard;
