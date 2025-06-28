import React from 'react';

export default function XLanding() {
    return (
        <div className="min-h-screen flex flex-col md:flex-row items-center justify-center bg-white font-sans">
            {/* Left section - Logo */}
            <div className="flex justify-center items-center w-full md:w-1/2 p-10">
                {/* Replace this div with an actual SVG of the X logo if available */}
                <div className="text-black text-[200px] font-bold">X</div>
            </div>

            {/* Right section - Auth Box */}
            <div className="w-full md:w-1/2 max-w-md p-10 space-y-6">
                <h1 className="text-4xl font-extrabold">Happening now</h1>
                <h2 className="text-2xl font-bold">Join today.</h2>

                <div className="space-y-3">
                    <button className="w-full flex items-center justify-center border border-gray-300 rounded-full py-2 font-semibold hover:bg-gray-100">
                        <img src="https://upload.wikimedia.org/wikipedia/commons/5/53/Google_%22G%22_Logo.svg" alt="Google" className="w-5 h-5 mr-2" />
                        Sign up with Google
                    </button>

                    <button className="w-full flex items-center justify-center border border-gray-300 rounded-full py-2 font-semibold hover:bg-gray-100">
                        <span className="mr-2 text-xl"></span>
                        Sign up with Apple
                    </button>

                    <div className="flex items-center justify-center text-gray-400">OR</div>

                    <button className="w-full bg-blue-500 text-white font-semibold rounded-full py-2 hover:bg-blue-600">
                        Create account
                    </button>

                    <p className="text-xs text-gray-500">
                        By signing up, you agree to the <a  className="text-blue-500 hover:underline">Terms of Service</a> and
                        <a  className="text-blue-500 hover:underline"> Privacy Policy</a>, including <a  className="text-blue-500 hover:underline">Cookie Use</a>.
                    </p>
                </div>

                <div className="pt-6">
                    <p className="font-semibold">Already have an account?</p>
                    <button className="w-full mt-2 border border-gray-300 rounded-full py-2 font-semibold hover:bg-gray-100">
                        Sign in
                    </button>
                    <button className="w-full mt-2 border border-gray-300 rounded-full py-2 font-semibold flex items-center justify-center hover:bg-gray-100">
                        <span className="mr-2">⚡</span> Get Grok
                    </button>
                </div>
            </div>
        </div>
    );
}
