function joinClasses(...classes) {
  return classes.filter(Boolean).join(" ");
}

function Container({
  as: Component = "div",
  className = "",
  children,
  size = "xl",
}) {
  const sizeClasses = {
    md: "max-w-4xl",
    lg: "max-w-6xl",
    xl: "max-w-7xl",
    full: "max-w-none",
  };

  return (
    <Component
      className={joinClasses(
        "mx-auto w-full px-4 sm:px-6 lg:px-8",
        sizeClasses[size] || sizeClasses.xl,
        className,
      )}
    >
      {children}
    </Component>
  );
}

export default Container;
