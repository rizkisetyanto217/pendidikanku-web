// import { formatInTimeZone } from "date-fns-tz";
// import { id as localeID } from "date-fns/locale";

// interface FormattedDateProps {
//   value: string | Date;
//   fullMonth?: boolean;
//   className?: string;
// }

// export default function FormattedDate({
//   value,
//   fullMonth = false,
//   className = "",
// }: FormattedDateProps) {
//   const formatPattern = fullMonth
//     ? "EEEE, dd MMMM yyyy - HH:mm"
//     : "EEEE, dd MMM yyyy - HH:mm";

//   const formatted = formatInTimeZone(value, "UTC", formatPattern, {
//     locale: localeID,
//   });

//   return <span className={className}>{formatted}</span>;
// }