
import {
  User,
  Clock,
  BarChart2,
  AlertTriangle,
  CheckCircle,
  Loader,
} from "lucide-react";

export type Patient = {
  name: string;
  avatar: string;
  time: string;
  priority: "Înaltă" | "Medie" | "Scăzută";
  reason: string;
  status: "Finalizat" | "Programat" | "În curs";
};

export type Summary = {
  title: string;
  value: string;
  percentageChange: string;
  icon: React.ComponentType<any>;
};

export const summaryData: Summary[] = [
  {
    title: "Pacienți astăzi",
    value: "10",
    percentageChange: "+5%",
    icon: User,
  },
  {
    title: "Prioritate ridicată",
    value: "3",
    percentageChange: "-2%",
    icon: AlertTriangle,
  },
  {
    title: "Media zilnică",
    value: "8",
    percentageChange: "+1.5%",
    icon: BarChart2,
  },
];

export const patientData: Patient[] = [
  {
    name: "Alexandru Popescu",
    avatar: "/placeholder-user.jpg",
    time: "09:00",
    priority: "Înaltă",
    reason: "Control de rutină",
    status: "Finalizat",
  },
  {
    name: "Maria Ionescu",
    avatar: "/placeholder-user.jpg",
    time: "09:30",
    priority: "Medie",
    reason: "Durere de cap",
    status: "Programat",
  },
  {
    name: "Andrei Georgescu",
    avatar: "/placeholder-user.jpg",
    time: "10:00",
    priority: "Scăzută",
    reason: "Rețetă nouă",
    status: "În curs",
  },
  {
    name: "Elena Vasilescu",
    avatar: "/placeholder-user.jpg",
    time: "10:30",
    priority: "Înaltă",
    reason: "Febră și tuse",
    status: "Programat",
  },
  {
    name: "Mihai Stoica",
    avatar: "/placeholder-user.jpg",
    time: "11:00",
    priority: "Medie",
    reason: "Verificare tensiune",
    status: "Finalizat",
  },
  {
    name: "Ioana Radu",
    avatar: "/placeholder-user.jpg",
    time: "11:30",
    priority: "Înaltă",
    reason: "Accidentare minoră",
    status: "Programat",
  },
  {
    name: "Cristian Dobre",
    avatar: "/placeholder-user.jpg",
    time: "12:00",
    priority: "Scăzută",
    reason: "Analize de sânge",
    status: "Finalizat",
  },
  {
    name: "Ana Dumitrescu",
    avatar: "/placeholder-user.jpg",
    time: "12:30",
    priority: "Medie",
    reason: "Control post-operator",
    status: "În curs",
  },
  {
    name: "George Stan",
    avatar: "/placeholder-user.jpg",
    time: "13:00",
    priority: "Scăzută",
    reason: "Alergie sezonieră",
    status: "Programat",
  },
  {
    name: "Laura Matei",
    avatar: "/placeholder-user.jpg",
    time: "13:30",
    priority: "Medie",
    reason: "Consultație generală",
    status: "Finalizat",
  },
];

export const priorityOptions = ["Toate", "Înaltă", "Medie", "Scăzută"];
export const statusOptions = ["Toate", "Finalizat", "Programat", "În curs"];
