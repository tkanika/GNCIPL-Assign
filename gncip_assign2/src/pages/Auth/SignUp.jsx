import React, {useContext, useState} from 'react';
import AuthLayout from '../../components/layouts/AuthLayout';
import { Link, useNavigate } from 'react-router-dom';
import Input from '../../components/Inputs/Input';
import {validateEmail } from "../../utils/helper";
import { UserContext } from '../../context/UserContext';

const SignUp = () => {
  const [fullName, setFullName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState(null);

  const {updateUser} = useContext(UserContext)
  const navigate = useNavigate();

  const handleSignUp = async (e) => {
    e.preventDefault();
    if(!fullName){
      setError("Please enter your name");
      return;
    }
    if (!validateEmail(email)){
      setError("Please enter a valid email address.");
      return;
    }
    if (!password){
      setError("Please enter the password");
      return;
    }
    setError("");
    // Static signup logic for demo
    updateUser({
      id: 1,
      name: fullName,
      email,
    });
    navigate("/dashboard");
  };

  return (
    <AuthLayout>
      <div className="lg:w-[70%] h-3/4 md:h-full flex flex-col justify-center">
        <h3 className="text-xl font-semibold text-black">Create Account</h3>
        <p className="text-xs text-slate-700 mt-[5px] mb-6">
          Please enter your details to sign up
        </p>
        <form onSubmit={handleSignUp}>
          <Input
            value={fullName}
            onChange={({target})=>setFullName(target.value)}
            label="Full Name"
            placeholder="John Doe"
            type="text"
          />
          <Input
            value={email}
            onChange={({target})=>setEmail(target.value)}
            label="Email Address"
            placeholder="john@example.com"
            type="text"
          />
          <Input
            value={password}
            onChange={({target})=>setPassword(target.value)}
            label="Password"
            placeholder="Min 8 Character"
            type="password"
          />
          {error && <p className="text-red-500 text-xs pb-2.5">{error}</p>}
          <button type="submit" className="btn-primary">SIGN UP</button>
          <p className="text-[13px] text-slate-800 mt-3">
            Already have an account?{' '}
            <Link className="font-medium text-primary underline" to="/login">Login</Link>
          </p>
        </form>
      </div>
    </AuthLayout>
  );
};

export default SignUp;