import React, { useState } from 'react';
import {
  Box,
  Container,
  Typography,
  Grid,
  Card,
  CardContent,
  CardActions,
  Button,
  Chip,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Switch,
  FormControlLabel,
  Paper,
  Fade,
  useTheme,
  useMediaQuery,
} from '@mui/material';
import {
  Check,
  Star,
  Business,
  Rocket,
  Diamond,
  TrendingUp,
  Security,
  Support,
  Speed,
  Analytics,
  Group,
  Cloud,
} from '@mui/icons-material';

interface PricingTier {
  name: string;
  price: number;
  yearlyPrice: number;
  description: string;
  features: string[];
  popular?: boolean;
  icon: React.ReactNode;
  color: string;
  gradient: string;
}

const Pricing: React.FC = () => {
  const [isYearly, setIsYearly] = useState(false);
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down('md'));

  const pricingTiers: PricingTier[] = [
    {
      name: 'Starter',
      price: 9,
      yearlyPrice: 90,
      description: 'Perfect for small teams and startups',
      features: [
        'Up to 5 team members',
        '10 projects',
        'Basic task management',
        'Email support',
        'Basic analytics',
        'Cloud storage (5GB)',
      ],
      icon: <Star sx={{ fontSize: 40 }} />,
      color: '#6366f1',
      gradient: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 100%)',
    },
    {
      name: 'Professional',
      price: 29,
      yearlyPrice: 290,
      description: 'Ideal for growing businesses',
      features: [
        'Up to 25 team members',
        'Unlimited projects',
        'Advanced task management',
        'Priority support',
        'Advanced analytics',
        'Cloud storage (50GB)',
        'Team collaboration tools',
        'Custom workflows',
        'API access',
      ],
      popular: true,
      icon: <Business sx={{ fontSize: 40 }} />,
      color: '#3b82f6',
      gradient: 'linear-gradient(135deg, #3b82f6 0%, #1d4ed8 100%)',
    },
    {
      name: 'Enterprise',
      price: 99,
      yearlyPrice: 990,
      description: 'For large organizations and enterprises',
      features: [
        'Unlimited team members',
        'Unlimited projects',
        'Enterprise task management',
        '24/7 phone support',
        'Advanced reporting',
        'Unlimited cloud storage',
        'Advanced security features',
        'Custom integrations',
        'Dedicated account manager',
        'SLA guarantees',
        'On-premise deployment',
        'Advanced compliance',
      ],
      icon: <Diamond sx={{ fontSize: 40 }} />,
      color: '#059669',
      gradient: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
    },
  ];

  const handleGetStarted = (tier: PricingTier) => {
    // In a real app, this would redirect to signup or contact sales
    console.log(`Selected ${tier.name} plan`);
    alert(`Thank you for choosing ${tier.name}! Redirecting to signup...`);
  };

  const handleContactSales = () => {
    alert('Our sales team will contact you soon!');
  };

  return (
    <Container maxWidth="lg" sx={{ py: 8 }}>
      {/* Header Section */}
      <Box textAlign="center" mb={8}>
        <Fade in timeout={800}>
          <Box>
            <Typography
              variant="h2"
              component="h1"
              gutterBottom
              sx={{
                fontWeight: 700,
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                backgroundClip: 'text',
                WebkitBackgroundClip: 'text',
                WebkitTextFillColor: 'transparent',
                fontSize: { xs: '2.5rem', md: '3.5rem' },
              }}
            >
              Choose Your Plan
            </Typography>
            <Typography
              variant="h5"
              color="text.secondary"
              sx={{ mb: 3, maxWidth: 600, mx: 'auto' }}
            >
              Scale your project management with our flexible pricing options
            </Typography>
            
            {/* Billing Toggle */}
            <Paper
              elevation={0}
              sx={{
                p: 1,
                display: 'inline-flex',
                alignItems: 'center',
                backgroundColor: 'grey.100',
                borderRadius: 3,
                mb: 4,
              }}
            >
              <Typography variant="body2" sx={{ mr: 2, color: isYearly ? 'text.secondary' : 'text.primary' }}>
                Monthly
              </Typography>
              <FormControlLabel
                control={
                  <Switch
                    checked={isYearly}
                    onChange={(e) => setIsYearly(e.target.checked)}
                    sx={{
                      '& .MuiSwitch-switchBase.Mui-checked': {
                        color: 'primary.main',
                      },
                    }}
                  />
                }
                label=""
              />
              <Typography variant="body2" sx={{ ml: 2, color: isYearly ? 'text.primary' : 'text.secondary' }}>
                Yearly
                <Chip
                  label="Save 20%"
                  size="small"
                  sx={{
                    ml: 1,
                    backgroundColor: 'success.main',
                    color: 'white',
                    fontSize: '0.7rem',
                  }}
                />
              </Typography>
            </Paper>
          </Box>
        </Fade>
      </Box>

      {/* Pricing Cards */}
      <Grid container spacing={4} justifyContent="center">
        {pricingTiers.map((tier, index) => (
          <Grid item xs={12} md={4} key={tier.name}>
            <Fade in timeout={800 + index * 200}>
              <Card
                elevation={tier.popular ? 8 : 2}
                sx={{
                  height: '100%',
                  display: 'flex',
                  flexDirection: 'column',
                  position: 'relative',
                  transform: tier.popular ? 'scale(1.05)' : 'scale(1)',
                  transition: 'all 0.3s ease-in-out',
                  '&:hover': {
                    transform: tier.popular ? 'scale(1.08)' : 'scale(1.03)',
                    boxShadow: tier.popular ? 12 : 6,
                  },
                  border: tier.popular ? `2px solid ${tier.color}` : 'none',
                }}
              >
                {tier.popular && (
                  <Box
                    sx={{
                      position: 'absolute',
                      top: -12,
                      left: '50%',
                      transform: 'translateX(-50%)',
                      backgroundColor: tier.color,
                      color: 'white',
                      px: 3,
                      py: 0.5,
                      borderRadius: 2,
                      fontSize: '0.875rem',
                      fontWeight: 600,
                      zIndex: 1,
                    }}
                  >
                    Most Popular
                  </Box>
                )}

                <CardContent sx={{ flexGrow: 1, p: 4 }}>
                  {/* Header */}
                  <Box textAlign="center" mb={3}>
                    <Box
                      sx={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        width: 80,
                        height: 80,
                        borderRadius: '50%',
                        background: tier.gradient,
                        color: 'white',
                        mb: 2,
                      }}
                    >
                      {tier.icon}
                    </Box>
                    <Typography variant="h4" component="h2" gutterBottom fontWeight={600}>
                      {tier.name}
                    </Typography>
                    <Typography variant="body1" color="text.secondary" sx={{ mb: 3 }}>
                      {tier.description}
                    </Typography>
                  </Box>

                  {/* Price */}
                  <Box textAlign="center" mb={4}>
                    <Typography variant="h3" component="div" fontWeight={700} color={tier.color}>
                      ${isYearly ? tier.yearlyPrice : tier.price}
                    </Typography>
                    <Typography variant="body2" color="text.secondary">
                      per {isYearly ? 'year' : 'month'}
                    </Typography>
                  </Box>

                  {/* Features */}
                  <List sx={{ mb: 3 }}>
                    {tier.features.map((feature, featureIndex) => (
                      <ListItem key={featureIndex} sx={{ px: 0, py: 0.5 }}>
                        <ListItemIcon sx={{ minWidth: 32 }}>
                          <Check
                            sx={{
                              color: tier.color,
                              fontSize: 20,
                            }}
                          />
                        </ListItemIcon>
                        <ListItemText
                          primary={feature}
                          primaryTypographyProps={{
                            variant: 'body2',
                            color: 'text.primary',
                          }}
                        />
                      </ListItem>
                    ))}
                  </List>
                </CardContent>

                <CardActions sx={{ p: 4, pt: 0 }}>
                  <Button
                    fullWidth
                    variant={tier.popular ? 'contained' : 'outlined'}
                    size="large"
                    onClick={() => handleGetStarted(tier)}
                    sx={{
                      py: 1.5,
                      borderRadius: 2,
                      fontWeight: 600,
                      backgroundColor: tier.popular ? tier.color : 'transparent',
                      borderColor: tier.color,
                      color: tier.popular ? 'white' : tier.color,
                      '&:hover': {
                        backgroundColor: tier.popular ? tier.color : tier.color,
                        color: 'white',
                        transform: 'translateY(-2px)',
                      },
                      transition: 'all 0.2s ease-in-out',
                    }}
                  >
                    {tier.name === 'Enterprise' ? 'Contact Sales' : 'Get Started'}
                  </Button>
                </CardActions>
              </Card>
            </Fade>
          </Grid>
        ))}
      </Grid>

      {/* Additional Features Section */}
      <Box mt={12} textAlign="center">
        <Fade in timeout={1000}>
          <Box>
            <Typography variant="h3" component="h2" gutterBottom fontWeight={600}>
              All Plans Include
            </Typography>
            <Typography variant="h6" color="text.secondary" sx={{ mb: 6 }}>
              Core features that help you succeed
            </Typography>

            <Grid container spacing={4} justifyContent="center">
              {[
                { icon: <Security />, title: 'Enterprise Security', description: 'Bank-level encryption and compliance' },
                { icon: <Speed />, title: 'Lightning Fast', description: 'Optimized for performance and speed' },
                { icon: <Analytics />, title: 'Advanced Analytics', description: 'Insights to drive better decisions' },
                { icon: <Group />, title: 'Team Collaboration', description: 'Built for seamless teamwork' },
                { icon: <Cloud />, title: 'Cloud Native', description: 'Always available, always secure' },
                { icon: <Support />, title: '24/7 Support', description: 'Help when you need it most' },
              ].map((feature, index) => (
                <Grid item xs={12} sm={6} md={4} key={index}>
                  <Fade in timeout={1200 + index * 100}>
                    <Paper
                      elevation={2}
                      sx={{
                        p: 4,
                        textAlign: 'center',
                        height: '100%',
                        transition: 'all 0.3s ease-in-out',
                        '&:hover': {
                          transform: 'translateY(-8px)',
                          boxShadow: 8,
                        },
                      }}
                    >
                      <Box
                        sx={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          width: 60,
                          height: 60,
                          borderRadius: '50%',
                          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                          color: 'white',
                          mb: 2,
                        }}
                      >
                        {feature.icon}
                      </Box>
                      <Typography variant="h6" component="h3" gutterBottom fontWeight={600}>
                        {feature.title}
                      </Typography>
                      <Typography variant="body2" color="text.secondary">
                        {feature.description}
                      </Typography>
                    </Paper>
                  </Fade>
                </Grid>
              ))}
            </Grid>
          </Box>
        </Fade>
      </Box>

      {/* CTA Section */}
      <Box mt={12} textAlign="center">
        <Fade in timeout={1400}>
          <Paper
            elevation={0}
            sx={{
              p: 6,
              background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
              color: 'white',
              borderRadius: 4,
            }}
          >
            <Typography variant="h3" component="h2" gutterBottom fontWeight={600}>
              Ready to Get Started?
            </Typography>
            <Typography variant="h6" sx={{ mb: 4, opacity: 0.9 }}>
              Join thousands of teams already using SmartFlow AI
            </Typography>
            <Box sx={{ display: 'flex', gap: 2, justifyContent: 'center', flexWrap: 'wrap' }}>
              <Button
                variant="contained"
                size="large"
                onClick={() => handleGetStarted(pricingTiers[1])}
                sx={{
                  backgroundColor: 'white',
                  color: 'primary.main',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'grey.100',
                    transform: 'translateY(-2px)',
                  },
                }}
              >
                Start Free Trial
              </Button>
              <Button
                variant="outlined"
                size="large"
                onClick={handleContactSales}
                sx={{
                  borderColor: 'white',
                  color: 'white',
                  px: 4,
                  py: 1.5,
                  borderRadius: 2,
                  fontWeight: 600,
                  '&:hover': {
                    backgroundColor: 'rgba(255,255,255,0.1)',
                    borderColor: 'white',
                  },
                }}
              >
                Contact Sales
              </Button>
            </Box>
          </Paper>
        </Fade>
      </Box>
    </Container>
  );
};

export default Pricing;
