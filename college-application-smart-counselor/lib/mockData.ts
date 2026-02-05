import { College } from "@/types/college";

export const colleges: College[] = [
  {
    id: "berkeley",
    name: "UC Berkeley",
    acceptanceRate: 0.14,
    avgCost: 38000,
    majors: ["CS", "EECS"],
  },
  {
    id: "ucla",
    name: "UCLA",
    acceptanceRate: 0.17,
    avgCost: 36000,
    majors: ["CS"],
  },
  {
    id: "uci",
    name: "UC Irvine",
    acceptanceRate: 0.28,
    avgCost: 32000,
    majors: ["CS"],
  },
  {
    id: "slo",
    name: "Cal Poly SLO",
    acceptanceRate: 0.30,
    avgCost: 29000,
    majors: ["CS", "SE"],
  },
];
