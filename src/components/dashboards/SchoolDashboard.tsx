import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useNavigate } from 'react-router-dom';
import { LogOut, School, FileText, Users, CheckCircle } from 'lucide-react';

const SchoolDashboard = () => {
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
      .channel('school-applications')
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
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: schoolData } = await supabase
      .from('schools')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (schoolData) {
      const { data, error } = await supabase
        .from('school_postings')
        .select('*')
        .eq('school_id', schoolData.id)
        .order('created_at', { ascending: false });

      if (!error && data) {
        setPostings(data);
      }
    }
  }

  async function fetchApplications() {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return;

    const { data: schoolData } = await supabase
      .from('schools')
      .select('id')
      .eq('user_id', user.id)
      .single();

    if (schoolData) {
      const { data, error } = await supabase
        .from('applications')
        .select(`
          *,
          school_postings!inner (
            title,
            school_id
          ),
          students (
            user_id,
            profiles (
              full_name,
              email
            )
          )
        `)
        .eq('school_postings.school_id', schoolData.id)
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
    { label: 'Active Postings', value: postings.filter(p => p.status === 'open').length, icon: FileText, color: 'text-primary' },
    { label: 'Total Applications', value: applications.length, icon: Users, color: 'text-secondary' },
    { label: 'Approved', value: applications.filter(a => a.status === 'approved').length, icon: CheckCircle, color: 'text-success' },
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="bg-card border-b border-border shadow-elevation-low sticky top-0 z-40">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="bg-gradient-secondary rounded-lg p-2">
                <School className="h-6 w-6 text-secondary-foreground" />
              </div>
              <div>
                <h1 className="text-xl font-bold">School Dashboard</h1>
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
          <p className="text-muted-foreground">Manage your postings and review applications</p>
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
                  <div className={`p-3 rounded-lg bg-gradient-secondary`}>
                    <stat.icon className={`h-6 w-6 ${stat.color}`} />
                  </div>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>

        {/* Quick Actions */}
        <section className="mb-8">
          <Card className="p-6 bg-gradient-to-br from-primary/5 to-secondary/5 border-primary/20">
            <h3 className="text-xl font-bold mb-4">Quick Actions</h3>
            <div className="flex flex-wrap gap-4">
              <Button variant="hero">
                Create New Posting
              </Button>
              <Button variant="outline">
                View All Applications
              </Button>
            </div>
          </Card>
        </section>

        {/* Recent Applications */}
        <section>
          <h3 className="text-2xl font-bold mb-4">Recent Applications</h3>
          <div className="space-y-4">
            {applications.length === 0 ? (
              <Card className="p-8 text-center">
                <p className="text-muted-foreground">No applications yet</p>
              </Card>
            ) : (
              applications.slice(0, 5).map((application) => (
                <motion.div
                  key={application.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <Card className="p-6 hover:shadow-elevation-medium transition-smooth">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <h4 className="text-lg font-bold mb-1">{application.students?.profiles?.full_name}</h4>
                        <p className="text-sm text-muted-foreground">{application.school_postings?.title}</p>
                      </div>
                      <div className="flex items-center gap-3">
                        <span className={`px-3 py-1 rounded-full text-sm font-medium
                          ${application.status === 'approved' ? 'bg-success/10 text-success' :
                            application.status === 'rejected' ? 'bg-destructive/10 text-destructive' :
                            'bg-secondary/10 text-secondary'}`}>
                          {application.status.charAt(0).toUpperCase() + application.status.slice(1)}
                        </span>
                        {application.status === 'pending' && (
                          <div className="flex gap-2">
                            <Button variant="success" size="sm">Approve</Button>
                            <Button variant="outline" size="sm">Reject</Button>
                          </div>
                        )}
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

export default SchoolDashboard;
