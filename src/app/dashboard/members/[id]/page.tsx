import { db } from "@/lib/db";
import { notFound } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";
import { suspendAccount, markFinesAsPaid } from "@/actions/user.actions";
import ResetPasswordButton from "./ResetPasswordButton";
import { RenewLoanModal } from "@/components/transactions/RenewLoanModal";
import { ArrowLeft, Mail, Book, Calendar, ReceiptText, History, ChevronRight, ShieldAlert, Info } from "lucide-react";

export default async function MemberProfilePage(props: { params: Promise<{ id: string }> }) {
  const params = await props.params;

  const user = await db.user.findUnique({
    where: { id: params.id },
    include: {
      transactions: {
        orderBy: { updatedAt: "desc" },
        include: { book: true, fine: true }
      }
    }
  });

  if (!user) {
    notFound();
  }

  // Helper calculations
  const totalBorrowed = user.transactions.length;
  const currentlyIssued = user.transactions.filter(t => t.status === "ISSUED").length;

  let totalFinesPaid = 0;
  let outstandingFine = 0;

  user.transactions.forEach(t => {
    if (t.fine) {
      if (t.fine.paid) {
        totalFinesPaid += Number(t.fine.amount);
      } else {
        outstandingFine += Number(t.fine.amount);
      }
    }
  });

  const memberSince = format(new Date(user.createdAt), "MMM yyyy");
  
  const formatCurrency = (amount: number) => `₹${amount.toFixed(2)}`;

  return (
    <div className="flex-1 flex flex-col overflow-hidden h-full bg-[#050505]">

      <main className="flex-1 overflow-y-auto p-8 space-y-6 bg-[#050505]">
        {/* Profile Header */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link href="/dashboard/members" className="bg-[#1F1F1F] hover:bg-[#2A2A2A] p-2 rounded-full transition-colors flex items-center justify-center">
              <ArrowLeft className="w-5 h-5 text-white" />
            </Link>
            <h2 className="text-2xl font-bold text-white tracking-tight">Member Profile</h2>
          </div>
          <div className="flex items-center gap-3">
            <button className="px-4 py-2 text-sm font-medium rounded-lg border border-[#1F1F1F] text-gray-300 hover:bg-[#111111] transition-colors">
              Edit Member
            </button>
            <form action={async () => {
              "use server";
              await suspendAccount(user.id);
            }}>
              <button 
                type="submit" 
                className="px-4 py-2 text-sm font-medium rounded-lg bg-[#450A0A] text-red-500 hover:bg-[#5a0d0d] transition-colors"
                title={(user as any).accountStatus === "SUSPENDED" ? "Unsuspend Member" : "Suspend Member"}
              >
                {(user as any).accountStatus === "SUSPENDED" ? "Unsuspend Member" : "Suspend Member"}
              </button>
            </form>
          </div>
        </div>

        {/* Main Profile Card */}
        <div className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1F1F1F] rounded-2xl p-8 flex  md:flex-row gap-8 items-center md:items-start shadow-2xl relative overflow-hidden">
          <div className="flex-shrink-0 w-20 h-20 bg-red-600 rounded-2xl flex items-center justify-center text-white text-3xl font-bold shadow-[0_0_20px_rgba(220,38,38,0.3)]">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div className="flex-1 space-y-4 z-10">
            <div className="text-center md:text-left">
              <h3 className="text-3xl font-bold tracking-tight text-white">{user.name}</h3>
              <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 mt-2 text-sm text-gray-400">
                <span className="flex items-center gap-1.5">
                  <Mail className="w-4 h-4" /> {user.email}
                </span>
                <span className="font-mono text-[10px] bg-[#1F1F1F] px-2 py-1 rounded text-white overflow-hidden text-ellipsis whitespace-nowrap max-w-[120px] inline-block align-bottom border border-[#2A2A2A]">
                  {user.membershipId}
                </span>
              </div>
            </div>
            <div className="flex flex-wrap justify-center md:justify-start gap-2">
              <span className="bg-[#1A1A1A] text-gray-400 text-[11px] px-2 py-1 rounded-md border border-[#2A2A2A]">{user.role}</span>
              <span className="bg-[#1A1A1A] text-gray-400 text-[11px] px-2 py-1 rounded-md border border-[#2A2A2A]">Member since {memberSince}</span>
              {user.address && (
                <span className="bg-[#1A1A1A] text-gray-400 text-[11px] px-2 py-1 rounded-md border border-[#2A2A2A]">{user.address}</span>
              )}
            </div>
          </div>
          
          <div className="grid grid-cols-3 gap-4 w-full md:w-auto z-10">
            <div className="p-4 bg-transparent border border-[#1A1A1A] rounded-xl text-center md:text-left min-w-[120px]">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Borrowed</p>
              <p className="text-3xl font-bold text-white">{totalBorrowed}</p>
            </div>
            <div className="p-4 bg-transparent border border-[#1A1A1A] rounded-xl text-center md:text-left min-w-[120px]">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Issued</p>
              <p className="text-3xl font-bold text-white">{currentlyIssued}</p>
            </div>
            <div className="p-4 bg-transparent border border-[#1A1A1A] rounded-xl text-center md:text-left min-w-[120px]">
              <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Fines Paid</p>
              <p className="text-3xl font-bold text-white">{formatCurrency(totalFinesPaid)}</p>
            </div>
          </div>
        </div>

        {/* Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
          {/* Left Column (60%) */}
          <div className="lg:col-span-3 space-y-6">
            
            {/* Active Loans */}
            <div className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1F1F1F] shadow-2xl rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#1F1F1F] flex justify-between items-center">
                <h4 className="font-bold flex items-center gap-2 text-white">
                  Active Loans <span className="bg-red-900/20 text-red-500 px-2 py-0.5 rounded text-xs">{currentlyIssued}</span>
                </h4>
                <button className="text-red-500 text-xs font-bold hover:underline">View All</button>
              </div>
              <div className="p-0">
                {user.transactions.filter(t => t.status === "ISSUED").map((t) => {
                  const dueDate = new Date(t.dueDate);
                  const isOverdue = dueDate < new Date();
                  const diffTime = Math.abs(new Date().getTime() - dueDate.getTime());
                  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
                  
                  return (
                    <div key={t.id} className="p-6 flex items-center justify-between border-b border-[#1F1F1F] last:border-0 hover:bg-[#0A0A0A] transition-colors">
                      <div className="flex items-center gap-4">
                        <div className="w-12 h-16 bg-[#1A1A1A] border border-[#2A2A2A] rounded flex items-center justify-center">
                          <Book className="w-5 h-5 text-gray-500" />
                        </div>
                        <div>
                          <p className="font-semibold text-white">{t.book.title}</p>
                          <p className={`text-xs mt-1 flex items-center gap-1.5 ${isOverdue ? 'text-red-500' : 'text-green-500'}`}>
                            <Calendar className="w-3.5 h-3.5" /> Due: {format(dueDate, "MMM dd, yyyy")}
                          </p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        {isOverdue ? (
                          <span className="px-2 py-1 bg-red-900/20 text-red-500 border border-red-900/50 animate-pulse text-[10px] font-bold rounded-md uppercase">
                            {diffDays} days overdue
                          </span>
                        ) : (
                          <span className="px-2 py-1 bg-green-900/20 text-green-500 border border-green-900/50 text-[10px] font-bold rounded-md uppercase">
                            On time
                          </span>
                        )}
                        <RenewLoanModal transaction={{
                          id: t.id,
                          dueDate: t.dueDate,
                          // @ts-expect-error Types unsynced until restarting Next server
                          renewalsUsed: t.renewalsUsed,
                          book: { title: t.book.title, author: t.book.author },
                          user: { name: user.name, membershipId: user.membershipId },
                          fine: t.fine
                        }} />
                      </div>
                    </div>
                  );
                })}
                {user.transactions.filter(t => t.status === "ISSUED").length === 0 && (
                  <div className="p-8 text-center text-gray-500 text-sm">
                    No active loans found.
                  </div>
                )}
              </div>
            </div>

            {/* Transaction History */}
            <div className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1F1F1F] shadow-2xl rounded-2xl overflow-hidden">
              <div className="p-6 border-b border-[#1F1F1F]">
                <h4 className="font-bold text-white">Transaction History</h4>
              </div>
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm text-gray-300">
                  <thead className="bg-[#050505] text-gray-500 font-bold text-xs uppercase tracking-wider border-b border-[#111111]">
                    <tr>
                      <th className="px-6 py-4">Book Title</th>
                      <th className="px-6 py-4">Issue Date</th>
                      <th className="px-6 py-4">Return Date</th>
                      <th className="px-6 py-4">Status</th>
                    </tr>
                  </thead>
                  <tbody className="bg-transparent divide-y divide-[#111111]">
                    {user.transactions.map((t) => {
                      const dueDate = new Date(t.dueDate);
                      const isOverdue = dueDate < new Date() && t.status === "ISSUED";

                      let statusStyles = "";
                      let displayStatus = t.status as string;

                      if (t.status === "RETURNED") {
                        statusStyles = "bg-[#1A1A1A] text-gray-500";
                      } else if (t.status === "OVERDUE" || isOverdue) {
                        displayStatus = "OVERDUE";
                        statusStyles = "bg-red-900/20 text-red-500 border border-red-900/50 animate-pulse";
                      } else {
                        displayStatus = "ON TIME";
                        statusStyles = "bg-green-900/20 text-green-500 border border-green-900/50";
                      }

                      return (
                        <tr key={t.id} className="hover:bg-[#0A0A0A] transition-colors">
                          <td className="px-6 py-4 font-medium text-white">{t.book.title}</td>
                          <td className="px-6 py-4 text-gray-400">{format(new Date(t.issueDate), "MMM dd, yyyy")}</td>
                          <td className="px-6 py-4 text-gray-400">
                            {t.returnDate ? format(new Date(t.returnDate), "MMM dd, yyyy") : "-"}
                          </td>
                          <td className="px-6 py-4">
                            <span className={`px-2 py-1 text-[10px] font-bold rounded-md uppercase ${statusStyles}`}>
                              {displayStatus}
                            </span>
                          </td>
                        </tr>
                      );
                    })}
                    {user.transactions.length === 0 && (
                      <tr>
                        <td colSpan={4} className="px-6 py-8 text-center text-gray-500">
                          No past transactions.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>

          {/* Right Column (40%) */}
          <div className="lg:col-span-2 space-y-6">
            
            {/* Fine Summary */}
            <div className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1F1F1F] shadow-2xl rounded-2xl p-6 relative overflow-hidden">
              <h4 className="font-bold mb-4 text-white relative z-10">Fine Summary</h4>
              <div className="flex items-end justify-between mb-6 relative z-10">
                <div>
                  <p className="text-[10px] text-gray-500 uppercase font-bold tracking-wider mb-1">Outstanding</p>
                  <p className={`text-4xl font-bold ${outstandingFine > 0 ? 'text-red-500' : 'text-gray-400'}`}>
                    {formatCurrency(outstandingFine)}
                  </p>
                </div>
              </div>
              <ReceiptText className={`w-12 h-12 opacity-10 absolute right-4 top-4 z-0 ${outstandingFine > 0 ? 'text-red-500' : 'text-gray-500'}`} />
              
              <div className="space-y-3 relative z-10">
                <form action={async () => {
                  "use server";
                  await markFinesAsPaid(user.id);
                }}>
                  <button 
                    type="submit"
                    className={`w-full py-3 rounded-xl font-bold transition-all shadow-lg ${outstandingFine === 0 ? 'bg-transparent text-gray-600 cursor-not-allowed border border-[#1F1F1F] shadow-none' : 'bg-red-600 hover:bg-red-700 text-white shadow-red-900/20'}`}
                    disabled={outstandingFine === 0}
                  >
                    Mark as Paid
                  </button>
                </form>
                <button 
                  className={`w-full py-3 rounded-xl text-sm font-medium transition-colors ${outstandingFine === 0 ? 'border border-[#111111] text-gray-700 cursor-not-allowed' : 'border border-[#1F1F1F] hover:bg-[#1A1A1A] text-gray-400 hover:text-white'}`}
                  disabled={outstandingFine === 0}
                >
                  Waive Fine
                </button>
              </div>
            </div>

            {/* Account Actions */}
            <div className="bg-gradient-to-br from-[#111111] to-[#0A0A0A] border border-[#1F1F1F] shadow-2xl rounded-2xl p-6">
              <h4 className="font-bold mb-4 text-white">Account Actions</h4>
              <div className="space-y-3">
                <ResetPasswordButton email={user.email} />
                
                <div className="flex items-center justify-between p-4 rounded-xl border border-[#1F1F1F] hover:bg-[#111111] transition-colors cursor-pointer group">
                  <div className="flex items-center gap-3">
                    <History className="w-5 h-5 text-gray-400 group-hover:text-white" />
                    <span className="text-sm font-medium text-gray-300 group-hover:text-white">Member Logs</span>
                  </div>
                  <ChevronRight className="w-4 h-4 text-gray-500 group-hover:text-white transition-colors" />
                </div>
                
                <form action={async () => {
                  "use server";
                  await suspendAccount(user.id);
                }} className="block">
                  <button type="submit" className="w-full flex items-center justify-between p-4 rounded-xl border border-red-900/30 bg-red-900/5 hover:bg-red-900/10 transition-colors cursor-pointer group">
                    <div className="flex items-center gap-3">
                      <ShieldAlert className="w-5 h-5 text-red-500 group-hover:scale-110 transition-transform" />
                      <span className="text-sm font-bold text-red-500">{(user as any).accountStatus === "SUSPENDED" ? "Restore Account" : "Suspend Account"}</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-red-500/50 group-hover:text-red-500 transition-colors" />
                  </button>
                </form>

              </div>
            </div>

            {/* System Status */}
            <div className="bg-[#0A0A0A] border border-dashed border-[#1F1F1F] shadow-2xl rounded-2xl p-6">
              <div className="flex items-start gap-4">
                <Info className="w-5 h-5 text-blue-500 flex-shrink-0" />
                <div>
                  <p className="text-sm font-bold text-white">Librarian Note</p>
                  <p className="text-xs text-gray-400 mt-1 leading-relaxed">
                    Member is active. {(user as any).accountStatus === "SUSPENDED" ? "Currently suspended. Cannot issue new books." : "All operations allowed."}
                  </p>
                </div>
              </div>
            </div>
            
          </div>
        </div>
      </main>
    </div>
  );
}
