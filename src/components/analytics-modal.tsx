// import { useState, useEffect } from "react";
// import { motion, AnimatePresence } from "framer-motion";
// import { X } from "lucide-react";
// import {
//   BarChart,
//   Bar,
//   XAxis,
//   YAxis,
//   CartesianGrid,
//   Tooltip,
//   ResponsiveContainer,
// } from "recharts";
// import {
//   Card,
//   CardContent,
//   CardDescription,
//   CardHeader,
//   CardTitle,
// } from "@/components/ui/card";

// interface AnalyticsModalProps {
//   isOpen: boolean;
//   onClose: () => void;
// }

// interface AnalyticsData {
//   totals: { totalRequests: number };
//   projects: Array<{ _id: string; count: number }>;
//   twitterHandles: Array<{ _id: string; count: number }>;
//   tweetTypes: Array<{ _id: string; count: number }>;
//   locations: Array<{ _id: string; count: number }>;
//   ipStats: Array<{ _id: string; count: number }>;
//   userAgents: Array<{ _id: string; count: number }>;
//   latestRequests: Array<{
//     _id: string;
//     name: string;
//     twitterHandle: string;
//     tweetType: string;
//     location: string;
//     createdAt: string;
//   }>;
//   history: Array<{
//     createdAt: string;
//   }>;
// }

// export default function AnalyticsModal({
//   isOpen,
//   onClose,
// }: AnalyticsModalProps) {
//   const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
//     null
//   );
//   const [loading, setLoading] = useState(true);

//   useEffect(() => {
//     if (!isOpen) return;

//     const fetchAnalytics = async () => {
//       try {
//         const response = await fetch(
//           "https://suinami-yubp.vercel.app/api/analytics/stats"
//         );
//         const data = await response.json();
//         setAnalyticsData(data);
//       } catch (error) {
//         console.error("Failed to fetch analytics:", error);
//       } finally {
//         setLoading(false);
//       }
//     };

//     fetchAnalytics();
//   }, [isOpen]);

//   return (
//     <AnimatePresence>
//       {isOpen && (
//         <>
//           {/* Backdrop */}
//           <motion.div
//             initial={{ opacity: 0 }}
//             animate={{ opacity: 1 }}
//             exit={{ opacity: 0 }}
//             onClick={onClose}
//             className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
//           />

//           {/* Modal */}
//           <motion.div
//             initial={{ opacity: 0, scale: 0.95, y: 20 }}
//             animate={{ opacity: 1, scale: 1, y: 0 }}
//             exit={{ opacity: 0, scale: 0.95, y: 20 }}
//             transition={{ type: "spring", damping: 25, stiffness: 300 }}
//             className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto"
//           >
//             <div className="w-full max-w-7xl bg-gradient-to-b from-[#0b1e34] to-[#030712] border border-white/10 rounded-2xl shadow-2xl shadow-cyan-400/20">
//               {/* Modal Header */}
//               <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#0b1e34] to-[#020617]/80 backdrop-blur-lg rounded-t-2xl">
//                 <div>
//                   <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
//                     Analytics Dashboard
//                   </h2>
//                   <p className="text-sm text-gray-400 mt-1">
//                     Real-time insights into usage and performance
//                   </p>
//                 </div>
//                 <motion.button
//                   onClick={onClose}
//                   whileHover={{ scale: 1.1 }}
//                   whileTap={{ scale: 0.95 }}
//                   className="p-2 hover:bg-white/10 rounded-lg transition-colors"
//                 >
//                   <X className="w-6 h-6 text-gray-300 hover:text-white" />
//                 </motion.button>
//               </div>

//               {/* Modal Content */}
//               <div className="max-h-[calc(100vh-120px)] overflow-y-auto px-6 py-8">
//                 {loading ? (
//                   <div className="flex items-center justify-center h-96">
//                     <motion.div
//                       animate={{ rotate: 360 }}
//                       transition={{
//                         duration: 2,
//                         repeat: Number.POSITIVE_INFINITY,
//                       }}
//                       className="w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full"
//                     />
//                   </div>
//                 ) : (
//                   <>
//                     {/* Charts Grid */}
//                     <div className=" w-full gap-6 mb-8">
//                       {/* Top Projects */}
//                       <motion.div
//                         initial={{ opacity: 0, scale: 0.95 }}
//                         animate={{ opacity: 1, scale: 1 }}
//                         transition={{ delay: 0.2 }}
//                       >
//                         <Card className="bg-white/5 border-white/10">
//                           <CardHeader>
//                             <CardTitle className="text-cyan-400">
//                               Top Projects
//                             </CardTitle>
//                             <CardDescription>
//                               Most requested projects
//                             </CardDescription>
//                           </CardHeader>
//                           <CardContent>
//                             <ResponsiveContainer width="100%" height={250}>
//                               <BarChart
//                                 data={analyticsData?.projects || []}
//                                 className="text-cyan-400"
//                               >
//                                 <CartesianGrid
//                                   strokeDasharray="3 3"
//                                   stroke="rgba(255,255,255,0.1)"
//                                 />
//                                 <XAxis
//                                   dataKey="_id"
//                                   stroke="rgba(255,255,255,0.5)"
//                                 />
//                                 <YAxis stroke="rgba(255,255,255,0.5)" />
//                                 <Tooltip
//                                   contentStyle={{
//                                     backgroundColor: "#0f172a",
//                                     border: "1px solid rgba(255,255,255,0.1)",
//                                   }}
//                                 />
//                                 <Bar
//                                   dataKey="count"
//                                   fill="#06b6d4"
//                                   radius={[8, 8, 0, 0]}
//                                 />
//                               </BarChart>
//                             </ResponsiveContainer>
//                           </CardContent>
//                         </Card>
//                       </motion.div>
//                     </div>

//                     {/* Latest Requests Table */}
//                     <motion.div
//                       initial={{ opacity: 0, y: 20 }}
//                       animate={{ opacity: 1, y: 0 }}
//                       transition={{ delay: 0.8 }}
//                     >
//                       <Card className="bg-white/5 border-white/10">
//                         <CardHeader>
//                           <CardTitle className="text-cyan-400">
//                             Latest Requests
//                           </CardTitle>
//                           <CardDescription>Recent API activity</CardDescription>
//                         </CardHeader>
//                         <CardContent>
//                           <div className="overflow-x-auto">
//                             <table className="w-full text-sm">
//                               <thead>
//                                 <tr className="border-b border-white/10">
//                                   <th className="text-left py-2 px-2 font-semibold text-gray-300">
//                                     Project
//                                   </th>
//                                   <th className="text-left py-2 px-2 font-semibold text-gray-300">
//                                     Twitter Handle
//                                   </th>
//                                   <th className="text-left py-2 px-2 font-semibold text-gray-300">
//                                     Type
//                                   </th>
//                                   {/* <th className="text-left py-2 px-2 font-semibold text-gray-300">Location</th> */}
//                                   <th className="text-left py-2 px-2 font-semibold text-gray-300">
//                                     Time
//                                   </th>
//                                 </tr>
//                               </thead>
//                               <tbody>
//                                 {analyticsData?.latestRequests
//                                   .slice(0, 5)
//                                   .map((request, index) => (
//                                     <motion.tr
//                                       key={request._id}
//                                       initial={{ opacity: 0 }}
//                                       animate={{ opacity: 1 }}
//                                       transition={{ delay: index * 0.05 }}
//                                       className="border-b border-white/5 hover:bg-white/5 transition-colors"
//                                     >
//                                       <td className="py-2 px-2 text-cyan-400 font-medium text-xs md:text-sm">
//                                         {request.name}
//                                       </td>
//                                       <td className="py-2 px-2 text-gray-400 text-xs md:text-sm">
//                                         {request.twitterHandle}
//                                       </td>
//                                       <td className="py-2 px-2">
//                                         <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
//                                           {request.tweetType}
//                                         </span>
//                                       </td>
//                                       {/* <td className="py-2 px-2 text-gray-400 text-xs md:text-sm">{request.location}</td> */}
//                                       <td className="py-2 px-2 text-gray-500 text-xs">
//                                         {new Date(
//                                           request.createdAt
//                                         ).toLocaleString()}
//                                       </td>
//                                     </motion.tr>
//                                   ))}
//                               </tbody>
//                             </table>
//                           </div>
//                         </CardContent>
//                       </Card>
//                     </motion.div>
//                   </>
//                 )}
//               </div>
//             </div>
//           </motion.div>
//         </>
//       )}
//     </AnimatePresence>
//   );
// }

import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X } from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";

interface AnalyticsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface AnalyticsData {
  totals: { totalRequests: number };
  projects: Array<{ _id: string; count: number }>;
  twitterHandles: Array<{ _id: string; count: number }>;
  tweetTypes: Array<{ _id: string; count: number }>;
  locations: Array<{ _id: string; count: number }>;
  ipStats: Array<{ _id: string; count: number }>;
  userAgents: Array<{ _id: string; count: number }>;
  latestRequests: Array<{
    _id: string;
    name: string;
    twitterHandle: string;
    tweetType: string;
    location: string;
    createdAt: string;
  }>;
  history: Array<{
    createdAt: string;
  }>;
}

export default function AnalyticsModal({
  isOpen,
  onClose,
}: AnalyticsModalProps) {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(
    null
  );
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!isOpen) return;

    const fetchAnalytics = async () => {
      try {
        const response = await fetch(
          "https://suinami-yubp.vercel.app/api/analytics/stats"
        );
        const data = await response.json();
        setAnalyticsData(data);
      } catch (error) {
        console.error("Failed to fetch analytics:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
  }, [isOpen]);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-40 bg-black/50 backdrop-blur-sm"
          />

          {/* Modal */}
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ type: "spring", damping: 25, stiffness: 300 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto scrollbar-hide"
          >
            <div className="w-full max-w-7xl bg-gradient-to-b from-[#0b1e34] to-[#030712] border border-white/10 rounded-2xl shadow-2xl shadow-cyan-400/20">
              {/* Modal Header */}
              <div className="sticky top-0 z-10 flex items-center justify-between p-6 border-b border-white/10 bg-gradient-to-r from-[#0b1e34] to-[#020617]/80 backdrop-blur-lg rounded-t-2xl">
                <div>
                  <h2 className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-cyan-400 to-blue-500 bg-clip-text text-transparent">
                    Analytics Dashboard
                  </h2>
                  <p className="text-sm text-gray-400 mt-1">
                    Real-time insights into usage and performance
                  </p>
                </div>
                <motion.button
                  onClick={onClose}
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.95 }}
                  className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                >
                  <X className="w-6 h-6 text-gray-300 hover:text-white" />
                </motion.button>
              </div>

              {/* Modal Content */}
              <div className="max-h-[calc(100vh-120px)] overflow-y-auto px-6 py-8 scrollbar-hide">
                {loading ? (
                  <div className="flex items-center justify-center h-96">
                    <motion.div
                      animate={{ rotate: 360 }}
                      transition={{
                        duration: 2,
                        repeat: Number.POSITIVE_INFINITY,
                      }}
                      className="w-12 h-12 border-3 border-cyan-400/30 border-t-cyan-400 rounded-full"
                    />
                  </div>
                ) : (
                  <>
                    {/* Charts Grid */}
                    <div className=" w-full gap-6 mb-8">
                      {/* Top Projects */}
                      <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: 0.2 }}
                      >
                        <Card className="bg-white/5 border-white/10">
                          <CardHeader>
                            <CardTitle className="text-cyan-400">
                              Top Projects
                            </CardTitle>
                            <CardDescription>
                              Most requested projects
                            </CardDescription>
                          </CardHeader>
                          <CardContent>
                            <ResponsiveContainer width="100%" height={250}>
                              <BarChart
                                data={analyticsData?.projects || []}
                                className="text-cyan-400"
                              >
                                <CartesianGrid
                                  strokeDasharray="3 3"
                                  stroke="rgba(255,255,255,0.1)"
                                />
                                <XAxis
                                  dataKey="_id"
                                  stroke="rgba(255,255,255,0.5)"
                                />
                                <YAxis stroke="rgba(255,255,255,0.5)" />
                                <Tooltip
                                  contentStyle={{
                                    backgroundColor: "#0f172a",
                                    border: "1px solid rgba(255,255,255,0.1)",
                                  }}
                                />
                                <Bar
                                  dataKey="count"
                                  fill="#06b6d4"
                                  radius={[8, 8, 0, 0]}
                                />
                              </BarChart>
                            </ResponsiveContainer>
                          </CardContent>
                        </Card>
                      </motion.div>
                    </div>

                    {/* Latest Requests Table */}
                    <motion.div
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: 0.8 }}
                    >
                      <Card className="bg-white/5 border-white/10">
                        <CardHeader>
                          <CardTitle className="text-cyan-400">
                            Latest Requests
                          </CardTitle>
                          <CardDescription>Recent API activity</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <div className="overflow-x-auto scrollbar-hide">
                            <table className="w-full text-sm">
                              <thead>
                                <tr className="border-b border-white/10">
                                  <th className="text-left py-2 px-2 font-semibold text-gray-300">
                                    Project
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold text-gray-300">
                                    Twitter Handle
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold text-gray-300">
                                    Type
                                  </th>
                                  <th className="text-left py-2 px-2 font-semibold text-gray-300">
                                    Time
                                  </th>
                                </tr>
                              </thead>
                              <tbody>
                                {analyticsData?.latestRequests
                                  .slice(0, 5)
                                  .map((request, index) => (
                                    <motion.tr
                                      key={request._id}
                                      initial={{ opacity: 0 }}
                                      animate={{ opacity: 1 }}
                                      transition={{ delay: index * 0.05 }}
                                      className="border-b border-white/5 hover:bg-white/5 transition-colors"
                                    >
                                      <td className="py-2 px-2 text-cyan-400 font-medium text-xs md:text-sm">
                                        {request.name}
                                      </td>
                                      <td className="py-2 px-2 text-gray-400 text-xs md:text-sm">
                                        {request.twitterHandle}
                                      </td>
                                      <td className="py-2 px-2">
                                        <span className="px-2 py-1 rounded-full bg-blue-500/20 text-blue-300 text-xs">
                                          {request.tweetType}
                                        </span>
                                      </td>
                                      <td className="py-2 px-2 text-gray-500 text-xs">
                                        {new Date(
                                          request.createdAt
                                        ).toLocaleString()}
                                      </td>
                                    </motion.tr>
                                  ))}
                              </tbody>
                            </table>
                          </div>
                        </CardContent>
                      </Card>
                    </motion.div>
                  </>
                )}
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
