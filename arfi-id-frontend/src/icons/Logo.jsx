const Logo = ({ className = "", size = 32 }) => {
    return (
        <div className={`flex items-center gap-2 ${className}`}>
            
            <span className="font-bold text-xl text-foreground">
                Arfi<span className="bg-primary text-primary-foreground px-1.5 py-0.5 rounded text-sm ml-0.5">ID</span>
            </span>
        </div>
    );
};

export default Logo;