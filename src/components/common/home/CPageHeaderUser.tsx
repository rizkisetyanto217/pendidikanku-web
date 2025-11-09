// // src/components/common/public/PageHeaderUser.tsx
// import * as React from "react";
// import { useNavigate, Link } from "react-router-dom";
// import { ArrowLeft } from "lucide-react";

// /* shadcn/ui */
// import { Button } from "@/components/ui/button";

// /* utils */
// import { cn } from "@/lib/utils";

// /* your dropdown */
// import CMenuDropdown from "@/components/costum/CMenuDropdown";

// interface PageHeaderProps {
//   title: string;
//   backTo?: string;
//   actionButton?: {
//     label: string;
//     to?: string;
//     onClick?: () => void;
//   };
//   onBackClick?: () => void;
//   withPaddingTop?: boolean;
//   className?: string;
// }

// export default function PageHeaderUser({
//   title,
//   backTo,
//   actionButton,
//   onBackClick,
//   withPaddingTop = false,
//   className,
// }: PageHeaderProps) {
//   const navigate = useNavigate();

//   const handleBack = React.useCallback(() => {
//     if (onBackClick) return onBackClick();
//     if (backTo) return navigate(backTo);
//     navigate(-1);
//   }, [navigate, backTo, onBackClick]);

//   return (
//     <div
//       className={cn(
//         "sticky top-0 z-30 w-full border-b bg-background/80 backdrop-blur supports-[backdrop-filter]:bg-background/60",
//         withPaddingTop ? "pt-4" : "pt-1",
//         "px-3 pb-2",
//         className
//       )}
//     >
//       <div className="mx-auto flex max-w-6xl items-center justify-between gap-3">
//         {/* Left: Back + Title */}
//         <div className="flex min-w-0 items-center gap-3">
//           {(backTo || onBackClick) && (
//             <Button
//               type="button"
//               variant="ghost"
//               size="icon"
//               className="rounded-lg"
//               onClick={handleBack}
//               aria-label="Kembali"
//             >
//               <ArrowLeft className="h-5 w-5" />
//             </Button>
//           )}

//           <h1 className="truncate text-lg font-semibold md:text-xl">{title}</h1>
//         </div>

//         {/* Right: Action (optional) + User menu */}
//         <div className="flex items-center gap-2">
//           {actionButton?.label &&
//             (actionButton.to ? (
//               <Button asChild className="rounded-full">
//                 <Link to={actionButton.to}>{actionButton.label}</Link>
//               </Button>
//             ) : (
//               <Button
//                 className="rounded-full"
//                 onClick={actionButton.onClick}
//                 type="button"
//               >
//                 {actionButton.label}
//               </Button>
//             ))}
//           <CMenuDropdown variant="icon" />
//         </div>
//       </div>
//     </div>
//   );
// }
