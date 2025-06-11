import React, { useState, useEffect } from "react";
import { useAuth } from "../contexts/AuthContext";
import { Button } from "../components/ui/button";
import { Input } from "../components/ui/input";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/ui/card";
import { Label } from "../components/ui/label";
import { Checkbox } from "../components/ui/checkbox";
import { toast } from "sonner";
import { LineChart, BarChart, PieChart, TrendingUp, Loader2, Eye, EyeOff } from "lucide-react";
import { cn } from "../lib/utils";
import taashLogo from "../assets/images/TAASH LOGO .png";

const Login: React.FC = () => {
  const [email, setEmail] = useState("demo@datacue.com");
  const [password, setPassword] = useState("password");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const { login, isLoading } = useAuth();
  const [animationStep, setAnimationStep] = useState(0);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const interval = setInterval(() => {
      setAnimationStep((prev) => (prev + 1) % 4);
    }, 2000);

    return () => clearInterval(interval);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsSubmitting(true);
    
    if (!email || !password) {
      setError("Please enter both email and password");
      setIsSubmitting(false);
      return;
    }

    try {
      await login(email, password);
      if (rememberMe) {
        localStorage.setItem("rememberedEmail", email);
      } else {
        localStorage.removeItem("rememberedEmail");
      }
    } catch (error) {
      setError("Invalid email or password");
      toast.error("Login failed. Please check your credentials.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter") {
      handleSubmit(e);
    }
  };

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-datacue-background p-4 relative overflow-hidden">
      {/* Animated Background Elements */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(20)].map((_, i) => (
          <div
            key={i}
            className={cn(
              "absolute w-8 h-8 rounded-full bg-datacue-primary/10",
              "transition-all duration-1000 ease-in-out",
              "hover:scale-110 hover:bg-datacue-primary/20",
              animationStep === 0 && "animate-float-1",
              animationStep === 1 && "animate-float-2",
              animationStep === 2 && "animate-float-3",
              animationStep === 3 && "animate-float-4"
            )}
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${i * 0.2}s`,
            }}
          />
        ))}
      </div>

      <div className="text-center mb-8 relative z-10">
        <div className="flex flex-col items-center animate-fade-in">
          <img 
            src={taashLogo} 
            alt="TAASH Logo" 
            className="h-32 w-auto object-contain" 
          />
          <span className="text-sm bg-datacue-primary text-white px-3 py-1 rounded-full font-medium mt-2">
            BETA
          </span>
        </div>
        <p className="text-sm text-datacue-primary/70 animate-fade-in-delay mt-2">
          Retail Analytics Platform
        </p>
      </div>

      <Card className="w-full max-w-md relative z-10 animate-slide-up shadow-lg">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold">Welcome Back</CardTitle>
          <CardDescription className="text-sm text-muted-foreground">
            Enter your credentials to access your dashboard
          </CardDescription>
        </CardHeader>
        <form onSubmit={handleSubmit} className="space-y-4">
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-sm font-medium">Email</Label>
              <Input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                onKeyPress={handleKeyPress}
                placeholder="your.email@example.com"
                required
                className={cn(
                  "transition-all duration-300",
                  "focus:ring-2 focus:ring-datacue-primary/20",
                  error && "border-red-500 focus:ring-red-500/20"
                )}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password" className="text-sm font-medium">Password</Label>
                <Button
                  variant="link"
                  className="p-0 h-auto font-normal text-xs"
                  type="button"
                  onClick={() => toast.info("Password reset feature coming soon")}
                  disabled={isSubmitting}
                >
                  Forgot password?
                </Button>
              </div>
              <div className="relative">
                <Input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  onKeyPress={handleKeyPress}
                  placeholder="••••••••"
                  required
                  className={cn(
                    "transition-all duration-300 pr-10",
                    "focus:ring-2 focus:ring-datacue-primary/20",
                    error && "border-red-500 focus:ring-red-500/20"
                  )}
                  disabled={isSubmitting}
                />
                <Button
                  type="button"
                  variant="ghost"
                  size="icon"
                  className="absolute right-0 top-0 h-full px-3 py-2 hover:bg-transparent"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isSubmitting}
                >
                  {showPassword ? (
                    <EyeOff className="h-4 w-4 text-muted-foreground" />
                  ) : (
                    <Eye className="h-4 w-4 text-muted-foreground" />
                  )}
                </Button>
              </div>
            </div>
            {error && (
              <p className="text-sm text-red-500 animate-shake">{error}</p>
            )}
            <div className="flex items-center space-x-2">
              <Checkbox
                id="remember"
                checked={rememberMe}
                onCheckedChange={(checked) => setRememberMe(checked as boolean)}
                disabled={isSubmitting}
              />
              <Label
                htmlFor="remember"
                className="text-sm font-normal leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
              >
                Remember me
              </Label>
            </div>
          </CardContent>
          <CardFooter>
            <Button 
              className={cn(
                "w-full bg-datacue-primary hover:bg-datacue-primary/90",
                "transition-all duration-300 transform hover:scale-[1.02]",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
              type="submit"
              disabled={isSubmitting || isLoading}
            >
              {isSubmitting || isLoading ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  Signing in...
                </>
              ) : (
                "Sign in"
              )}
            </Button>
          </CardFooter>
        </form>
      </Card>

      <div className="mt-6 text-center relative z-10 animate-fade-in-delay-2">
        <p className="text-sm text-datacue-primary/70">
          Demo credentials are pre-filled for your convenience.
        </p>
      </div>
    </div>
  );
};

export default Login;
