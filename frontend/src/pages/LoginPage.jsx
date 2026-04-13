import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Login } from "../components";
import { login } from "../redux/actions/auth.action";
import { clearAuthError } from "../redux/slices/auth.slice";

function LoginPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error, user } = useSelector((state) => state.auth);
  const [values, setValues] = useState({ email: "", password: "" });

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const result = await dispatch(login(values));

    if (login.fulfilled.match(result)) {
      navigate(
        result.payload?.role === "restaurant-owner" ? "/restaurants" : "/",
      );
    }
  };

  return (
    <Login
      onSubmit={handleSubmit}
      isLoading={loading}
      values={values}
      onChange={handleChange}
      error={error}
    />
  );
}

export default LoginPage;
