import React, { useState,useRef,useEffect } from 'react';
import {  Mail, ChevronLeft, Eye, EyeOff, User, Lock, AlertCircle, AlignCenter } from 'lucide-react';
import '../index.css';
import { auth, provider   } from "../firebase";
import { signInWithPopup ,signInWithEmailAndPassword, signOut ,createUserWithEmailAndPassword,sendEmailVerification} from "firebase/auth";
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { useNavigate } from "react-router-dom";
import axios from 'axios';
import CryptoJS from 'crypto-js';
import Cookies from 'js-cookie';
import { Phone } from 'lucide-react';

const GoogleIcon = () => (
  <svg className="w-5 h-5" viewBox="0 0 24 24">
    <path
      fill="#4285F4"
      d="M21.35 11.1h-9.17v2.73h6.51c-.33 3.81-3.5 5.44-6.5 5.44C8.36 19.27 5 16.25 5 12c0-4.1 3.2-7.27 7.2-7.27 3.09 0 4.9 1.97 4.9 1.97L19 4.72S16.56 2 12.1 2C6.42 2 2.03 6.8 2.03 12c0 5.05 4.13 10 10.22 10 5.35 0 9.25-3.67 9.25-9.09 0-1.15-.15-1.81-.15-1.81z"
    />
  </svg>
);

const StockMarketPattern = React.memo(() => (
  <>
    <style>
    {`
      body, html {
        overflow: hidden;
        margin: 0;
        height: 100%;
      }
      .video-container {
        position: fixed;
        top: 0;
        left: 0;
        width: 100vw;
        height: 100vh;
        z-index: -1; /* Keep the video in the background */
      }
      .video-container video {
        width: 100%;
        height: 100%;
        object-fit: cover; /* Ensures the video covers the screen properly */
      }
    `}
  </style>
    <defs>
      <pattern
        id="stock-pattern"
        x="0"
        y="0"
        width="100%"
        height="100%"
        patternUnits="userSpaceOnUse"
      >
        <video
          className="absolute inset-0 w-full h-full object-cover"
          x="0"
          y="0"
          width="100%"
          height="100%"
          preserveAspectRatio="xMidYMid slice"
          autoPlay
          loop
          muted
          
        >
          
          <source src="/stockvideo.mp4" type="video/mp4" />
        </video>
      </pattern>
    </defs>
    <div className="video-container">
      <rect x="0" y="0" width="100%" height="100%" fill="url(#stock-pattern)" />
    </div>
  </>
));




const Login = (log) => {
  const [isLogin, setIsLogin] = useState(true);
  const logoutTimerRef = useRef(null); 

  const [errors, setErrors] = useState({});

  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setphone] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [confirmPassword, setConfirmPassword] = useState('');

  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [token, settoken] = useState(null);
  const [loading, setLoading] = useState(false);

  const [shouldHaveRainbowEffect,setshouldHaveRainbowEffect]= useState(false);

  const navigate = useNavigate(); 

  useEffect(()=>{
    log=isLoggedIn;
  },[isLoggedIn])

  const signUp = async (email, password) => {
    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      await sendEmailVerification(user);
      toast.dismiss()
      toast.success('User created. Please verify the email and log in');
      clear();
      setIsLogin(true);
    } catch (error) {
      console.log(error.message)
      if(error.message==='Firebase: Error (auth/email-already-in-use).'){
        toast.dismiss()
        toast.error('Email Already Exists Please Log in')
        setshouldHaveRainbowEffect(true);
        setTimeout(() => {
          setshouldHaveRainbowEffect(false);
        }, 3000);
      }
    }
  };

  const handleLogin = async (e) => {
    setLoading(true);
    let encrypted="";
  
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      const ps=process.env.REACT_APP_SECRET;
      const auth1= await user.getIdToken();
      if (user && !user.emailVerified) {
        toast.error('Email not verified. Please verify your email',{position:'top-center'});
      } else {
        try {
          setIsLoggedIn(true);
          navigate('/home',{replace:true});
          
          const key = CryptoJS.enc.Utf8.parse(ps.padEnd(32, ' ')); 
          const iv = CryptoJS.enc.Utf8.parse(ps.padEnd(16, ' '));
           const val={email1:email,auth:auth1};
           const valString = JSON.stringify(val);
          encrypted = CryptoJS.AES.encrypt(valString, key, {
              iv: iv,
              mode: CryptoJS.mode.CBC,
              padding: CryptoJS.pad.Pkcs7
          }).toString();
          
          
  
  
  
          
      } catch (error) {
          console.error('Encryption/Decryption error:', error);
      }
        // const response = await axios.post(process.env.REACT_APP_BACKEND_URL + "login", {encrypted} ,{ withCredentials: true });
        const expires = new Date();
        // expires.setTime(expires.getTime() + 8 * 60 * 60 * 1000)
        // settoken(response.data);
        // const dat=response.data;
  
        //     Cookies.set('sessionToken', dat , { expires, secure: true, sameSite: 'Strict' });
        //     setLoading(false);  
        //     setIsLoggedIn(true);
        //     toast.success('Login successful!');
        //     log.user1(true);
        //     log.email(email);
        //     clear();
        //     navigate('/GiriviSearch', { replace: true })
    
        
            
      }
      
    } catch (error) {
      console.error(error);
      setLoading(false);
      settoken(null);
      toast.dismiss()
      toast.error('Invalid email or password. If You are a New User Please Signup');
      setshouldHaveRainbowEffect(true);

      setTimeout(() => {
        setshouldHaveRainbowEffect(false);
      }, 3000);
       
    }
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      setIsLoggedIn(false);
      // log.user1(false);
      settoken(null);
      toast.dismiss()

      toast.success('Logout successful!');
      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current); // Clear the logout timer on manual logout
      }

      if (logoutTimerRef.current) {
        clearTimeout(logoutTimerRef.current); // Clear the timer on manual logout
        logoutTimerRef.current = null; // Reset the timer reference
      }

    } catch (error) {
      console.error(error);
      toast.dismiss()

      toast.error('Error occurred during logout. Please try again.');
     
      
    }
  };


  useEffect(() => {
    const handleSignOut = async () => {
      try {
        await auth.signOut(); 
        navigate('/', { replace: true });
        setIsLoggedIn(false);
      } catch (error) {
        console.error('Error signing out:', error);
      }
    };
  
    handleSignOut();
  }, []); 


  const rainbowTextClass = 'bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-clip-text text-transparent';
  const rainbowBorderClass = 'border-4 border-transparent bg-gradient-to-r from-red-500 via-purple-500 to-blue-500 bg-origin-border';


  
  
  const signInWithGoogle = async () => {
    try {
      const result = await signInWithPopup(auth, provider);
      const user = result.user;
      setEmail(user.email)
      setIsLoggedIn(true);
      console.log("User Info:", user.email);
      navigate('/home', { replace: true });

    } catch (error) {
      console.error("Error during Google Sign-In:", error);
    }
  };

  const validateEmail = (email) => {
    const re = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return re.test(email);
  };


  const validatePassword = (password) => {
    const hasMinLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumber = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password); // Adjust special characters as needed
    return { hasMinLength, hasUpperCase, hasLowerCase, hasNumber, hasSpecialChar };
  };

  const clear  = () =>{
    setErrors({});
    setName('');
    setEmail('');
    setPassword('');
    setphone('');
    setShowPassword(false);
    setConfirmPassword('');
  }

 
  const validateForm = () => {
    const newErrors = {};
    if (!email) {
      newErrors.email = 'Email is required';
    } else if (!validateEmail(email)) {
      newErrors.email = 'Please enter a valid email';
    }
  
    if (!phone && !isLogin) {
      newErrors.phone = 'Mobile number is required';
    } else if (phone && !/^\d{10}$/.test(phone)) {
      newErrors.phone = 'Please enter a valid mobile number in the format 1234567890';
    }
  
    if (!password) {
      newErrors.password = 'Password is required';
    } else if (!isLogin) {
      const passwordValidation = validatePassword(password);
      if (!passwordValidation.hasMinLength) {
        newErrors.password = 'Password must be at least 8 characters';
      } else if (!(passwordValidation.hasUpperCase && passwordValidation.hasLowerCase && passwordValidation.hasNumber && passwordValidation.hasSpecialChar)) {
        newErrors.password = 'Password must include uppercase, lowercase, a number, and a special character.';
      }
    }
  
    if (!isLogin && password !== confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
    }
  
    if (!name && !isLogin) {
      newErrors.name = 'Name is required';
    }
  

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };
   
  const handleSubmit = (e) => {
    if (validateForm()) {
      if(isLogin){
        handleLogin();
      }
      else{
        signUp(email,password);
      }
    } else {
      console.log('Form is invalid, show errors');
    }
  };
  
  return (
    <>
    <ToastContainer
      position="top-center"
      autoClose={2500}
      hideProgressBar={false}
      newestOnTop={false}
      rtl={false}
      pauseOnFocusLoss
      pauseOnHover
    />    
    <div className="min-h-screen relative bg-gradient-to-br from-blue-900 to-purple-900 flex flex-col items-center xl:items-end justify-center xl:pr-12  p-5 overflow-hidden">

    <StockMarketPattern />
      <div className="absolute inset-0 bg-gradient-to-br from-blue-900/50 to-purple-900/50"></div> 
      <div className="relative bg-white/95 backdrop-blur-sm rounded-xl shadow-xl w-full max-w-md p-6">
        <div className="text-center mb-3 " >
          <h1
            className="text-2xl font-bold text-black-900 object-cover"
            style={{
              display: 'inline-block',
              overflow: 'hidden',
              color:'black',
              borderRight: '0.15em solid rgba(255, 255, 255, 0.75)',
              whiteSpace: 'nowrap',
              animation: 'typing 1s steps(30) 1s 1 normal both, no-blink 0s 1.4s forwards',
            }}
          >
            {isLogin ? 'Welcome back' : 'Create account'}
          </h1>
        </div>
        <style>
          {`
            @keyframes typing {
              from {
                width: 0;
                border-color: black;
              }
              to {
                width: 100%;
                border-color: black;
              }
            }

            @keyframes no-blink {
              to {
                border-color: transparent;
              }
            }
          `}
        </style>
      <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 " style={{paddingTop:'15px'}}>
          <div >
            <p className="text-gray-500" style={{textAlign:'center',margin:'10px',marginBottom:'30px'}}>
            {isLogin ? 'Sign in to continue' : 'Sign up to get started'}
            </p>
          </div>
          <>
            <div className="space-y-6">
                  <>
                  {!isLogin && (


                    <div className="w-full">
                      <div className="relative w-full">
                        <input
                          type="text"
                          name="name"
                          value={name}
                          onChange={(e) => setName(e.target.value)}
                          className={`w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors?.name ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your name"
                        />
                        
                        <User className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"/>
                      </div>

                        {errors?.name && (
                          <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                            <AlertCircle className="w-4 h-4" />
                            <span>{errors.name}</span>
                          </div>
                        )}
                    </div>
                  )}

                  {!isLogin && (


                  <div className="w-full">
                    <div className="relative w-full">
                      <input
                        type="text"
                        name="Phone"
                        value={`+91 ${phone}`} 
                          onChange={(e) => {
                            const phoneValue = e.target.value.replace(/^(\+91\s?)?/, '').slice(0, 10); 
                            setphone(phoneValue); 
                          }}
                        className={`w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors?.phone ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Enter your Mobile Number"
                      />
                      
                      <Phone
                            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5"
                          />
                    </div>

                      {errors?.phone && (
                        <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                          <AlertCircle className="w-4 h-4" />
                          <span>{errors.phone}</span>
                        </div>
                      )}
                  </div>
                  )}
                  <div className="w-full">
                    <div className="relative w-full">
                    <input
                      type="email"
                      name="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      className={`w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                        errors?.email ? 'border-red-500' : 'border-gray-300'
                      }`}
                      placeholder="Enter your email"
                    />
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                    </div>
                    {errors?.email && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.email}</span>
                      </div>
                    )}
                  </div>

                  <div className="w-full">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                          type={showPassword ? "text" : "password"}
                          value={password}
                          onChange={(e) => setPassword(e.target.value)}
                          className={`w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                            errors.password ? 'border-red-500' : 'border-gray-300'
                          }`}
                          placeholder="Enter your password"
                        />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                      >
                        {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                      </button>
                    </div>
                    {errors.password && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.password}</span>
                      </div>
                    )}
                  </div>
                  {!isLogin && (
                  <div className="w-full">
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
                      <input
                        type={showPassword ? "text" : "password"}
                        value={confirmPassword}
                        onChange={(e) => setConfirmPassword(e.target.value)}
                        className={`w-full p-2 pl-10 border rounded-lg focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent ${
                          errors.confirmPassword ? 'border-red-500' : 'border-gray-300'
                        }`}
                        placeholder="Confirm your password"
                      />
                    </div>
                    {errors.confirmPassword && (
                      <div className="flex items-center gap-1 mt-1 text-red-500 text-sm">
                        <AlertCircle className="w-4 h-4" />
                        <span>{errors.confirmPassword}</span>
                      </div>
                    )}
                  </div>
                  )}
                  </>
                  <button
                    type="submit"
                    onClick={() => handleSubmit()}
                    className="w-full bg-purple-600 text-white py-2 rounded-lg hover:bg-purple-700 transition-colors focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                  >
                    {isLogin ? 'Sign In' : 'Sign Up'}
                  </button>

              
                <>

                <style>
                  {`
                    @keyframes rotate-rainbow {
                      0% {
                        background-position: 0% 50%;
                      }
                      100% {
                        background-position: 100% 50%;
                      }
                    }

                    .rainbow-border2 {
                      background: linear-gradient(50deg, red, orange, yellow, green, blue, indigo, orange, yellow,red,red, orange, yellow, green, blue, indigo, orange, yellow,red);
                      background-size: 300% 300%;
                      animation: rotate-rainbow 3s  infinite;
                      border-radius: 10%; 
                      display: inline-block;
                      position: relative;
                    }

                  

                    .rainbow-border2::before {
                      content: '';
                      position: absolute;
                      top: -4px;
                      left: -4px;
                      right: -4px;
                      bottom: -4px;
                      border-radius: 50%;
                      z-index: -1;
                      background: inherit; 
                      animation: inherit; /* Inherits animation */
                    }
                  `}
                </style>
                  <div className="relative">
                    <div className="absolute inset-0 flex items-center">
                      <div className="w-full border-t border-gray-300"></div>
                    </div>
                    <div className="relative flex justify-center text-sm">
                      <span className="px-2 bg-white text-gray-500">Or continue with</span>
                    </div>
                  </div>

                  {shouldHaveRainbowEffect?
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="rainbow-border2"
                    style={{
                      width: '100%', 
                      border: '1px solid #d1d5db',
                      borderRadius: '0.3rem', 
                      display: 'flex', 
                      alignItems: 'center', 
                      justifyContent: 'center', 
                      gap: '0.5rem', 
                      backgroundColor: 'white', 
                      transition: 'background-color 0.2s ease', 
                      outline: 'none', 
                      boxSizing: 'border-box', 
                      
                    }}
                  >
                  <div className="py-2 border border-gray-300 rounded-lg bg-gray-50 transition-colors flex items-center justify-center gap-2 " style={{width:'97.3%',height:'50%',marginTop:'5px',marginBottom:'5px'}}>
                    <GoogleIcon />
                    Continue with Google
                  </div>
                 
                </button>
                  
                  :

                  <>
           
                  
                  <button
                    type="button"
                    onClick={signInWithGoogle}
                    className="w-full border border-gray-300 py-2 rounded-lg hover:bg-gray-50 transition-colors flex items-center justify-center gap-2 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:ring-offset-2"
                    style={{marginBottom:'26px',marginTop:'28px'}}
                  >
                    <GoogleIcon />
                    Continue with Google
                  </button>
                  </>
                  }
                </>
            
            </div>

            <p className="text-center mt-6 ">
              {isLogin ? "Don't have an account? " : "Already have an account? "}
              <>
                <style>
                  {`
                    @keyframes rotate-rainbow {
                      0% {
                        background-position: 0% 50%;
                      }
                      100% {
                        background-position: 100% 50%;
                      }\
                    }

                    .rainbow-border {
                      background: linear-gradient(50deg, red, orange, yellow, green, blue, indigo, orange, yellow,red,red, orange, yellow, green, blue, indigo, orange, yellow,red);
                      background-size: 300% 300%;
                      animation: rotate-rainbow 3s  infinite;
                      border-radius: 10%; 
                      padding: 4px; 
                      display: inline-block;
                      position: relative;
                    }

                  

                    .rainbow-border::before {
                      content: '';
                      position: absolute;
                      top: -4px;
                      left: -4px;
                      padding: 6px; 
                      right: -4px;
                      bottom: -4px;
                      border-radius: 50%;
                      z-index: -1;

                      background: inherit; 
                      animation: inherit; /* Inherits animation */
                    }
                  `}
                </style>
                {shouldHaveRainbowEffect ? (
                  <div className="rainbow-border">
                    <button
                      type="button"
                      onClick={() => {
                        setIsLogin(!isLogin);
                        clear();
                        setErrors({});
                      }}
                      className="text-white hover:text-gray-200  transition-all duration-300 ease-in-out font-bold"

            
                    >
                      <div className="text-purple-600 hover:text-purple-700  transition-all duration-600 ease-in-out font-bold" style={{background:'white',borderRadius:'2px',padding:'4px',marginTop:'0px'}}> 
                      {isLogin ? 'Sign up' : 'Sign in'}
                      </div>
                     
                    </button>
                  </div>
                ) : (
                  <button
                    type="button"
                    onClick={() => {
                      setIsLogin(!isLogin);
                      clear();
                      setErrors({});
                    }}
                    className="text-purple-600 hover:text-purple-700 transition-all duration-600 ease-in-out font-bold " style={{padding:'6px',paddingBottom:'0px',paddingTop:'0px',marginBottom:'15px'}}
                  >
                    {isLogin ? 'Sign up' : 'Sign in'}
                  </button>
                )}
              </>
            </p>
          </>
       
      </div>
    </div>
      
    </div>


    
    </>
  );
};

export default Login;
