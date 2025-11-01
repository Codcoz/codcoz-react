import { useState } from "react";
import {
  Home,
  FileText,
  Users,
  Package,
  MessageSquare,
  UtensilsCrossed,
} from "lucide-react";

const menuItems = [
  { id: "home", icon: Home, label: "Home" },
  { id: "pedidos", icon: FileText, label: "Pedidos" },
  { id: "funcionarios", icon: Users, label: "Funcionários" },
  { id: "produtos", icon: Package, label: "Produtos" },
  { id: "gastronomia", icon: UtensilsCrossed, label: "Gastronomia" },
  { id: "chat", icon: MessageSquare, label: "ChefIA" },
];

export default function Sidebar({ currentPage, onNavigate, onWidthChange }) {
  const [isHovered, setIsHovered] = useState(false);

  const handleMouseEnter = () => {
    setIsHovered(true);
    if (onWidthChange) onWidthChange(220);
  };

  const handleMouseLeave = () => {
    setIsHovered(false);
    if (onWidthChange) onWidthChange(72);
  };

  return (
    <div
      className={`h-screen max-h-screen bg-[#ebebeb] flex flex-col items-start pt-6 transition-all duration-200 ease-in-out shrink-0 relative ${
        isHovered ? "w-[220px]" : "w-[72px]"
      }`}
    >
      <div
        className="absolute top-6 w-[56px] h-[56px] shrink-0 pointer-events-none z-10"
        style={{
          left: "8px",
          maxWidth: "56px",
          minWidth: "56px",
          transition: "none",
        }}
      >
        <svg
          className="w-full h-full"
          viewBox="0 0 88 88"
          fill="none"
          style={{ width: "56px", height: "56px" }}
        >
          <path
            d="M41.9394 30.4112V31.1735C41.9394 31.5039 42.0126 31.8301 42.1538 32.1288L42.2632 32.3603C42.6021 33.0772 43.1826 33.6519 43.9028 33.9837L43.9221 33.9926C44.3727 34.2002 44.863 34.3077 45.3591 34.3077H50.7493C51.0976 34.3077 51.4451 34.3386 51.7879 34.4002L51.9069 34.4215C52.3707 34.5048 52.8205 34.6529 53.2431 34.8614L53.3149 34.8969C53.6491 35.0618 53.9609 35.2686 54.243 35.5122C54.6038 35.8239 54.9116 36.1923 55.1542 36.6028L55.2396 36.7474C55.5028 37.1927 55.7026 37.6804 55.8296 38.1818C55.9417 38.6246 56 39.0857 56 39.5425V40.5835C56 41.1042 55.9353 41.6228 55.8075 42.1276L55.7466 42.3681C55.6733 42.6574 55.5683 42.9378 55.4334 43.2041C55.1679 43.7284 54.7914 44.1887 54.3301 44.553L54.2548 44.6125C53.9648 44.8415 53.6477 45.0338 53.3106 45.185L52.8886 45.3744C52.6212 45.4944 52.3361 45.5702 52.0445 45.599L51.3575 45.6668C51.3021 45.6723 51.2463 45.6622 51.1964 45.6375C51.0947 45.5873 51.0303 45.4838 51.0303 45.3704V43.1624V41.7654C51.0303 41.5026 50.9796 41.2423 50.8809 40.9987C50.8191 40.8463 50.7391 40.7019 50.6427 40.5686L50.5166 40.3943C50.2956 40.0888 50.0167 39.8297 49.6958 39.6317L49.6557 39.607C49.3628 39.4263 49.0374 39.3046 48.6978 39.2487C48.5561 39.2254 48.4127 39.2137 48.269 39.2137H36.9697V50.2256C36.9697 50.4619 36.9959 50.6975 37.0478 50.9281L37.0975 51.1487C37.1729 51.4838 37.3246 51.7969 37.5409 52.0638C37.6446 52.1918 37.7622 52.308 37.8916 52.4101L37.9306 52.4409C38.177 52.6355 38.4556 52.7853 38.7538 52.8834L38.8756 52.9235C39.219 53.0364 39.5781 53.094 39.9396 53.094H40.6061H48.1124C48.3603 53.094 48.6078 53.0738 48.8524 53.0335L49.261 52.9663C49.7068 52.893 50.1288 52.7145 50.492 52.4456C50.7678 52.2414 51.0044 51.989 51.1903 51.7005L51.7576 50.8205L51.9897 50.5341C52.4737 49.9369 53.0998 49.4707 53.8108 49.1783C54.0577 49.0767 54.313 48.9969 54.5737 48.9397L55.1738 48.808C55.2396 48.7936 55.3067 48.7863 55.374 48.7863H55.5888C55.6969 48.7863 55.8007 48.8289 55.8777 48.9049C55.9559 48.9822 56 49.0875 56 49.1975V53.453L55.9603 53.7666C55.9063 54.1933 55.789 54.6097 55.6124 55.0019C55.4673 55.3242 55.2833 55.6276 55.0646 55.9052L54.9328 56.0724C54.6757 56.3988 54.3763 56.6894 54.0424 56.9366C53.7325 57.166 53.3954 57.3562 53.0388 57.5029L52.9206 57.5515C52.3907 57.7695 51.831 57.9064 51.2603 57.9576L50.7879 58H37.1936C36.8833 58 36.5703 57.9718 36.2649 57.917C35.6926 57.8143 35.1353 57.6148 34.6289 57.3291L34.5738 57.2981C33.9954 56.9717 33.4897 56.5306 33.0879 56.0018C32.7688 55.5817 32.52 55.1126 32.3512 54.6128L32.3239 54.5319C32.1892 54.1331 32.1017 53.7199 32.0631 53.3007L32 52.6154V44.2418C32 43.9217 32.0292 43.6023 32.0871 43.2876L32.1098 43.1646C32.1976 42.6876 32.362 42.228 32.5966 41.8035C32.8435 41.3566 33.1647 40.9549 33.5464 40.6158L33.7121 40.4686C34.0238 40.1917 34.3713 39.9577 34.7453 39.7732C35.1752 39.561 35.6352 39.4164 36.1091 39.3444L36.9697 39.2137V35.1226C36.9697 34.7397 37.0046 34.3575 37.0739 33.981L37.1174 33.7452C37.1803 33.4035 37.2842 33.0706 37.4268 32.7538C37.6059 32.3561 37.8445 31.9875 38.1338 31.6611C38.4066 31.3532 38.7223 31.0855 39.0706 30.8667L39.4583 30.6231C39.7376 30.4477 40.0372 30.3069 40.3505 30.2038L40.7757 30.0638C40.9042 30.0216 41.0386 30 41.174 30H41.5282C41.6363 30 41.7401 30.0426 41.8171 30.1186C41.8953 30.1958 41.9394 30.3012 41.9394 30.4112Z"
            fill="#333333"
          />
        </svg>
      </div>

      <div
        className="flex flex-col gap-2 w-full px-2 overflow-y-auto flex-1 overflow-x-hidden mt-[80px]"
        onMouseEnter={handleMouseEnter}
        onMouseLeave={handleMouseLeave}
      >
        {menuItems.map((item) => {
          const Icon = item.icon;
          const isActive = currentPage === item.id;

          return (
            <div
              key={item.id}
              className="flex items-center gap-[14px] w-full pl-2 cursor-pointer transition-colors duration-150"
              onClick={() => onNavigate && onNavigate(item.id)}
            >
              <div
                className={`w-[56px] h-[56px] rounded-lg flex items-center justify-center transition-all duration-150 shrink-0 ${
                  isActive ? "bg-[#002a45] text-white" : "text-[#333333]"
                }`}
              >
                <Icon
                  className={`w-6 h-6 ${
                    isActive ? "text-white" : "text-[#333333]"
                  }`}
                />
              </div>
              <p
                className={`text-base font-['Inter'] whitespace-nowrap transition-all duration-200 ${
                  isHovered
                    ? "opacity-100 translate-x-0"
                    : "opacity-0 translate-x-[-8px] pointer-events-none"
                } ${isActive ? "font-bold" : ""}`}
              >
                {item.label}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}
