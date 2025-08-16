import React, { createContext, useContext, useReducer, useEffect } from "react";
import { authAPI } from "../services/api";

// Auth Context
const AuthContext = createContext();

// Auth actions
const AUTH_ACTIONS = {
  LOGIN_START: "LOGIN_START",
  LOGIN_SUCCESS: "LOGIN_SUCCESS",
  LOGIN_FAILURE: "LOGIN_FAILURE",
  LOGOUT: "LOGOUT",
  SET_USER: "SET_USER",
  UPDATE_USER: "UPDATE_USER",
};

// Initial state
const initialState = {
  user: null,
  isAuthenticated: false,
  isLoading: true, // Start as true to prevent flash of login page
  error: null,
  token: null, // <-- store JWT here
};

// Auth reducer
const authReducer = (state, action) => {
  switch (action.type) {
    case AUTH_ACTIONS.LOGIN_START:
      return { ...state, isLoading: true, error: null };

    case AUTH_ACTIONS.LOGIN_SUCCESS:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: true,
        isLoading: false,
        error: null,
      };

    case AUTH_ACTIONS.LOGIN_FAILURE:
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false, error: action.payload };

    case AUTH_ACTIONS.LOGOUT:
      return { ...state, user: null, token: null, isAuthenticated: false, isLoading: false, error: null };

    case AUTH_ACTIONS.SET_USER:
      return {
        ...state,
        user: action.payload.user,
        token: action.payload.token,
        isAuthenticated: !!action.payload.user,
        isLoading: false,
      };

    case AUTH_ACTIONS.UPDATE_USER:
      return { ...state, user: { ...state.user, ...action.payload } };

    default:
      return state;
  }
};

// Auth Provider Component
export const AuthProvider = ({ children }) => {
  const [state, dispatch] = useReducer(authReducer, initialState);

  // Check for existing auth token on app load
  useEffect(() => {
    const token = localStorage.getItem("token");
    const user = localStorage.getItem("user");

    if (token && user) {
      try {
        const parsedUser = JSON.parse(user);
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: { user: parsedUser, token } });
      } catch (error) {
        console.error("Error parsing user data:", error);
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        dispatch({ type: AUTH_ACTIONS.SET_USER, payload: { user: null, token: null } });
      }
    } else {
      // No auth found, stop loading
      dispatch({ type: AUTH_ACTIONS.SET_USER, payload: { user: null, token: null } });
    }
  }, []);

  // Auth actions
  const login = async (credentials) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authAPI.login(credentials);

      const user = {
        id: response.userId,
        username: response.username,
        email: response.email,
        profilePicture: null,
      };

      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token: response.access_token } });

      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const register = async (userData) => {
    dispatch({ type: AUTH_ACTIONS.LOGIN_START });

    try {
      const response = await authAPI.register(userData);

      const user = {
        id: response.userId,
        username: response.username,
        email: response.email,
      };

      localStorage.setItem("token", response.access_token);
      localStorage.setItem("user", JSON.stringify(user));

      dispatch({ type: AUTH_ACTIONS.LOGIN_SUCCESS, payload: { user, token: response.access_token } });

      return { success: true };
    } catch (error) {
      dispatch({ type: AUTH_ACTIONS.LOGIN_FAILURE, payload: error.message });
      return { success: false, error: error.message };
    }
  };

  const logout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    dispatch({ type: AUTH_ACTIONS.LOGOUT });
  };

  const updateUser = (userData) => {
    const updatedUser = { ...state.user, ...userData };
    localStorage.setItem("user", JSON.stringify(updatedUser));
    dispatch({ type: AUTH_ACTIONS.UPDATE_USER, payload: userData });
  };

  return (
    <AuthContext.Provider
      value={{
        ...state,
        login,
        register,
        logout,
        updateUser,
        AUTH_ACTIONS,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use auth context
export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error("useAuth must be used within an AuthProvider");
  return context;
};

export default AuthContext;
