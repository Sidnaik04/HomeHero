const Skeleton = ({ className = "", variant = "text" }) => {
  const baseClass = "animate-pulse bg-dark-hover rounded";

  const variants = {
    text: "h-4 w-full",
    title: "h-8 w-3/4",
    avatar: "h-12 w-12 rounded-full",
    card: "h-48 w-full",
    button: "h-10 w-24",
  };

  return (
    <div className={`${baseClass} ${variants[variant]} ${className}`}></div>
  );
};

export default Skeleton;
