import { useState, useEffect, useRef } from 'react';
import { supabase } from '@/lib/supabase';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { useToast } from '@/components/ui/use-toast';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { Mail, ArrowRight, Github, Chrome, Loader2, Sparkles, ArrowLeft, Shield, Zap, LayoutDashboard, Lock, Eye, EyeOff } from 'lucide-react';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [usePassword, setUsePassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [otpSent, setOtpSent] = useState(false);
    const [emailFocused, setEmailFocused] = useState(false);
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const containerRef = useRef<HTMLDivElement>(null);
    const { toast } = useToast();
    const navigate = useNavigate();

    // Track mouse for parallax effect
    useEffect(() => {
        const handleMouseMove = (e: MouseEvent) => {
            if (containerRef.current) {
                const rect = containerRef.current.getBoundingClientRect();
                setMousePosition({
                    x: (e.clientX - rect.left) / rect.width - 0.5,
                    y: (e.clientY - rect.top) / rect.height - 0.5,
                });
            }
        };
        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, []);

    const handleAuth = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);

        try {
            if (usePassword) {
                const { error } = await supabase.auth.signInWithPassword({ email, password });
                if (error) throw error;
                navigate('/dashboard', { replace: true });
            } else {
                const { error } = await supabase.auth.signInWithOtp({
                    email,
                    options: {
                        emailRedirectTo: `${window.location.origin}/dashboard`,
                    }
                });

                if (error) throw error;

                setOtpSent(true);
                toast({
                    title: 'Magic link sent',
                    description: 'Check your email for the login link.',
                    duration: 5000,
                });
            }
        } catch (error: any) {
            toast({
                title: 'Authentication failed',
                description: error.message,
                variant: 'destructive',
                duration: 4000,
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOAuthSignIn = async (provider: 'github' | 'google') => {
        setLoading(true);
        try {
            const { error } = await supabase.auth.signInWithOAuth({
                provider,
                options: {
                    redirectTo: `${window.location.origin}/dashboard`,
                },
            });
            if (error) throw error;
        } catch (error: any) {
            toast({
                title: 'OAuth failed',
                description: error.message,
                variant: 'destructive',
            });
            setLoading(false);
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.08,
                delayChildren: 0.1,
            },
        },
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: { y: 0, opacity: 1 },
    };

    const features = [
        { icon: <Zap className="w-5 h-5" />, title: "Smart Connections", desc: "Everything connects automatically." },
        { icon: <Shield className="w-5 h-5" />, title: "Vault Security", desc: "Your data, encrypted and private." },
        { icon: <LayoutDashboard className="w-5 h-5" />, title: "Unified View", desc: "Finance, tasks, and notes in one place." },
    ];

    return (
        <div
            ref={containerRef}
            className="relative min-h-screen flex overflow-hidden bg-background"
        >
            {/* Split Layout: Left Side (Desktop Only) */}
            <div className="hidden lg:flex lg:w-1/2 relative items-center justify-center p-12 border-r border-white/5 overflow-hidden">
                {/* Animated Background Elements */}
                <div className="absolute inset-0 opacity-[0.03]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                        backgroundSize: '48px 48px',
                    }} />
                </div>

                <motion.div
                    className="absolute top-20 -right-20 w-96 h-96 bg-white/[0.02] rounded-full blur-[128px]"
                    animate={{
                        x: mousePosition.x * 40,
                        y: mousePosition.y * 40,
                    }}
                    transition={{ type: 'spring', damping: 30 }}
                />

                <div className="relative z-10 max-w-lg space-y-12">
                    <motion.div
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="space-y-4"
                    >
                        <h2 className="text-5xl font-bold tracking-tight text-white leading-tight">
                            Build your <br />
                            <span className="text-gradient">Second Brain.</span>
                        </h2>
                        <p className="text-xl text-muted-foreground leading-relaxed">
                            Vault is a premium, connected space for your notes, tasks, and finances.
                            Experience clarity like never before.
                        </p>
                    </motion.div>

                    <div className="space-y-6">
                        {features.map((feature, idx) => (
                            <motion.div
                                key={idx}
                                initial={{ opacity: 0, x: -20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: 0.2 + idx * 0.1 }}
                                className="flex gap-4 p-4 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.05] transition-colors group cursor-default"
                            >
                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center group-hover:scale-110 transition-transform">
                                    {feature.icon}
                                </div>
                                <div>
                                    <h4 className="font-medium text-white">{feature.title}</h4>
                                    <p className="text-sm text-muted-foreground">{feature.desc}</p>
                                </div>
                            </motion.div>
                        ))}
                    </div>

                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        transition={{ delay: 0.6 }}
                        className="pt-8 flex items-center gap-6"
                    >
                        <div className="flex -space-x-3">
                            {[1, 2, 3, 4].map((i) => (
                                <div key={i} className="w-10 h-10 rounded-full border-2 border-background bg-white/10" />
                            ))}
                        </div>
                        <p className="text-sm text-muted-foreground">
                            Join <span className="text-white font-medium">500+</span> individuals building their Vault.
                        </p>
                    </motion.div>
                </div>
            </div>

            {/* Right Side / Mobile Layout */}
            <div className="w-full lg:w-1/2 flex items-center justify-center relative p-6">
                {/* Mobile Background Elements */}
                <div className="lg:hidden absolute inset-0 opacity-[0.02]">
                    <div className="absolute inset-0" style={{
                        backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.3) 1px, transparent 0)`,
                        backgroundSize: '48px 48px',
                    }} />
                </div>

                <motion.div
                    className="w-full max-w-md relative z-10"
                    variants={containerVariants}
                    initial="hidden"
                    animate="visible"
                >
                    {/* Back button */}
                    <motion.button
                        onClick={() => navigate('/')}
                        className="absolute -top-16 left-0 flex items-center gap-2 text-sm text-muted-foreground hover:text-white transition-colors group"
                        variants={itemVariants}
                    >
                        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                        Back to home
                    </motion.button>

                    {/* Logo Section */}
                    <motion.div
                        className="text-center mb-8"
                        variants={itemVariants}
                    >
                        <motion.div
                            className="relative inline-flex mb-6"
                            whileHover={{ scale: 1.02 }}
                            whileTap={{ scale: 0.98 }}
                        >
                            <div className="absolute inset-0 bg-white/5 rounded-3xl blur-xl opacity-50" />
                            <div className="relative w-50 h-50 rounded-3xl flex items-center justify-center p-4">
                                <img src="/logo.png" alt="Rocha Negra Logo" className="w-full h-full object-contain" />
                            </div>
                        </motion.div>

                        <motion.h1
                            className="text-3xl font-light tracking-tight text-white mb-2"
                        >
                            Welcome back
                        </motion.h1>
                        <motion.p
                            className="text-muted-foreground text-sm"
                        >
                            Access your second brain
                        </motion.p>
                    </motion.div>

                    {/* Main Card */}
                    <motion.div
                        className="relative group mr-0"
                        variants={itemVariants}
                    >
                        <div className="absolute -inset-0.5 bg-gradient-to-r from-white/0 via-white/5 to-white/0 rounded-2xl blur opacity-0 group-hover:opacity-100 transition duration-700" />

                        <div className="relative glass-card rounded-2xl p-8">
                            <AnimatePresence mode="wait">
                                {!otpSent ? (
                                    <motion.form
                                        key="login-form"
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        onSubmit={handleAuth}
                                        className="space-y-6"
                                    >
                                        {/* Email Field */}
                                        <div className="space-y-2">
                                            <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                Email address
                                            </Label>
                                            <div className="relative">
                                                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                <Input
                                                    type="email"
                                                    placeholder="name@domain.com"
                                                    className="pl-10 h-12 bg-white/[0.02] border-white/10 focus:border-white/20 focus:ring-0 rounded-xl transition-all text-white placeholder:text-muted-foreground/50"
                                                    value={email}
                                                    onChange={(e) => setEmail(e.target.value)}
                                                    onFocus={() => setEmailFocused(true)}
                                                    onBlur={() => setEmailFocused(false)}
                                                    required
                                                />
                                                <AnimatePresence>
                                                    {emailFocused && email && (
                                                        <motion.div
                                                            initial={{ scale: 0, opacity: 0 }}
                                                            animate={{ scale: 1, opacity: 1 }}
                                                            exit={{ scale: 0, opacity: 0 }}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2"
                                                        >
                                                            <Sparkles className="w-4 h-4 text-muted-foreground/50" />
                                                        </motion.div>
                                                    )}
                                                </AnimatePresence>
                                            </div>
                                        </div>

                                        {/* Password Field (Conditional) */}
                                        <AnimatePresence>
                                            {usePassword && (
                                                <motion.div
                                                    initial={{ height: 0, opacity: 0, marginTop: 0 }}
                                                    animate={{ height: 'auto', opacity: 1, marginTop: 24 }}
                                                    exit={{ height: 0, opacity: 0, marginTop: 0 }}
                                                    className="space-y-2 overflow-hidden"
                                                >
                                                    <Label className="text-xs font-medium text-muted-foreground uppercase tracking-wider">
                                                        Password
                                                    </Label>
                                                    <div className="relative">
                                                        <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                                                        <Input
                                                            type={showPassword ? 'text' : 'password'}
                                                            placeholder="••••••••"
                                                            className="pl-10 pr-10 h-12 bg-white/[0.02] border-white/10 focus:border-white/20 focus:ring-0 rounded-xl transition-all text-white placeholder:text-muted-foreground/50"
                                                            value={password}
                                                            onChange={(e) => setPassword(e.target.value)}
                                                            required={usePassword}
                                                        />
                                                        <button
                                                            type="button"
                                                            onClick={() => setShowPassword(!showPassword)}
                                                            className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-white transition-colors"
                                                        >
                                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                                        </button>
                                                    </div>
                                                </motion.div>
                                            )}
                                        </AnimatePresence>

                                        {/* Submit Button */}
                                        <Button
                                            type="submit"
                                            disabled={loading}
                                            className="relative w-full h-12 bg-white text-background hover:bg-white/90 rounded-xl font-medium transition-all active:scale-[0.98] disabled:opacity-50 disabled:active:scale-100"
                                        >
                                            {loading ? (
                                                <motion.div
                                                    animate={{ rotate: 360 }}
                                                    transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
                                                >
                                                    <Loader2 className="w-5 h-5" />
                                                </motion.div>
                                            ) : (
                                                <motion.div
                                                    className="flex items-center justify-center gap-2"
                                                    whileHover={{ gap: '12px' }}
                                                >
                                                    <span>{usePassword ? 'Continue' : 'Send Magic Link'}</span>
                                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                                </motion.div>
                                            )}
                                        </Button>

                                        {/* Toggle Password/Magic Link */}
                                        <div className="text-center pt-2">
                                            <motion.button
                                                type="button"
                                                className="text-sm text-muted-foreground hover:text-white transition-colors"
                                                onClick={() => setUsePassword(!usePassword)}
                                                whileHover={{ scale: 1.02 }}
                                                whileTap={{ scale: 0.98 }}
                                            >
                                                {usePassword ? 'Use magic link instead?' : 'Use password instead?'}
                                            </motion.button>
                                        </div>

                                        {/* Divider */}
                                        <div className="relative my-6">
                                            <div className="absolute inset-0 flex items-center">
                                                <div className="w-full border-t border-white/5" />
                                            </div>
                                            <div className="relative flex justify-center text-[10px] uppercase font-bold tracking-widest">
                                                <span className="px-3 text-muted-foreground/50">Or continue with</span>
                                            </div>
                                        </div>

                                        {/* OAuth Buttons */}
                                        <div className="grid grid-cols-2 gap-3">
                                            <motion.button
                                                type="button"
                                                className="flex items-center justify-center gap-2 h-11 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl border border-white/5 transition-all text-muted-foreground hover:text-white"
                                                onClick={() => handleOAuthSignIn('github')}
                                                whileHover={{ y: -1 }}
                                                whileTap={{ y: 0 }}
                                            >
                                                <Github className="w-4 h-4" />
                                                <span className="text-sm">GitHub</span>
                                            </motion.button>
                                            <motion.button
                                                type="button"
                                                className="flex items-center justify-center gap-2 h-11 bg-white/[0.02] hover:bg-white/[0.04] rounded-xl border border-white/5 transition-all text-muted-foreground hover:text-white"
                                                onClick={() => handleOAuthSignIn('google')}
                                                whileHover={{ y: -1 }}
                                                whileTap={{ y: 0 }}
                                            >
                                                <Chrome className="w-4 h-4" />
                                                <span className="text-sm">Google</span>
                                            </motion.button>
                                        </div>
                                    </motion.form>
                                ) : (
                                    <motion.div
                                        key="otp-sent"
                                        initial={{ opacity: 0, x: 10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: -10 }}
                                        className="text-center space-y-6 py-4"
                                    >
                                        <div className="w-16 h-16 bg-white/5 rounded-2xl flex items-center justify-center mx-auto mb-2">
                                            <Mail className="w-8 h-8 text-white" />
                                        </div>
                                        <div className="space-y-2">
                                            <h3 className="text-xl font-medium text-white">Check your email</h3>
                                            <p className="text-muted-foreground text-sm leading-relaxed">
                                                We've sent a magic link to <span className="text-white font-medium">{email}</span>. Click the link to log in instantly.
                                            </p>
                                        </div>
                                        <div className="pt-4 space-y-4">
                                            <p className="text-xs text-muted-foreground">
                                                Didn't receive it? Check your spam folder.
                                            </p>
                                            <Button
                                                variant="ghost"
                                                onClick={() => setOtpSent(false)}
                                                className="text-sm text-muted-foreground hover:text-white hover:bg-white/5 flex items-center gap-2 mx-auto"
                                            >
                                                <ArrowLeft className="w-4 h-4" />
                                                Enter a different email
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>
                    </motion.div>

                    {/* Footer */}
                    <motion.div
                        className="mt-8 text-center text-[10px] uppercase tracking-[0.2em] text-muted-foreground/30 font-bold"
                        variants={itemVariants}
                    >
                        <p>Enterprise Grade Encryption</p>
                    </motion.div>
                </motion.div>
            </div>
        </div>
    );
};

export default Login;