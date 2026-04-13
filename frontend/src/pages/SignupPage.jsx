import { useState } from "react";
import { useDispatch, useSelector } from "react-redux";
import { useNavigate } from "react-router-dom";
import { Signup } from "../components";
import { signup } from "../redux/actions/auth.action";
import { clearAuthError } from "../redux/slices/auth.slice";

function SignupPage() {
  const dispatch = useDispatch();
  const navigate = useNavigate();
  const { loading, error } = useSelector((state) => state.auth);
  const [values, setValues] = useState({
    name: "",
    email: "",
    phoneNumber: "",
    role: "user",
    password: "",
    passwordConfirm: "",
  });
  const [avatarFile, setAvatarFile] = useState(null);

  const handleChange = (event) => {
    const { name, value } = event.target;
    setValues((current) => ({ ...current, [name]: value }));
    if (error) {
      dispatch(clearAuthError());
    }
  };

  const handleFileChange = (event) => {
    setAvatarFile(event.target.files?.[0] || null);
  };

  const handleSubmit = async (event) => {
    event.preventDefault();
    const formData = new FormData();

    Object.entries(values).forEach(([key, value]) => {
      formData.append(key, value);
    });

    if (avatarFile) {
      formData.append("avatar", avatarFile);
    }

    const result = await dispatch(signup(formData));

    if (signup.fulfilled.match(result)) {
      navigate(values.role === "restaurant-owner" ? "/restaurants" : "/");
    }
  };

  return (
    <Signup
      onSubmit={handleSubmit}
      isLoading={loading}
      values={values}
      onChange={handleChange}
      onFileChange={handleFileChange}
      error={error}
    />
  );
}

export default SignupPage;
