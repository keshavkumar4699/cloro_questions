import Link from "next/link";
import Image from "next/image";
import logo from "@/app/icon.png";
import config from "@/config";

const Logo = () => (
  <div className="flex lg:flex-1">
    <Link className="flex items-center gap-2 shrink-0" href="/" title={`${config.appName} homepage`}>
      <Image 
        src={logo} 
        alt={`${config.appName} logo`} 
        className="w-8 h-8" 
        placeholder="blur" 
        priority={true} 
        width={32} 
        height={32} 
      />
      <span className="font-extrabold text-lg text-base-content">{config.appName}</span>
    </Link>
  </div>
);

export default Logo;