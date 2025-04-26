export const formatDate = (inputDate) => {
  if (inputDate === undefined) return "Haven't Started Yet";
  const date = new Date(inputDate);
  const months = [
    "Jan",
    "Feb",
    "Mar",
    "Apr",
    "May",
    "Jun",
    "Jul",
    "Aug",
    "Sep",
    "Oct",
    "Nov",
    "Dec",
  ];
  const month = months[date.getMonth()];

  const day = date.getDate();
  const suffix =
    day >= 10 && day <= 20 ? "th" : ["st", "nd", "rd"][(day % 10) - 1] || "th";

  const year = date.getFullYear();

  let hours = date.getHours();
  const ampm = hours >= 12 ? "PM" : "AM";
  hours = hours % 12 || 12;

  const minutes = date.getMinutes().toString().padStart(2, "0");
  const output = `${month} ${day}${suffix} ${year} ${hours}:${minutes} ${ampm}`;
  return output.replace(/NaN/g, "0");
};
