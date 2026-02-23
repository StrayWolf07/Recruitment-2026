"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import GlassCard from "@/components/ui/GlassCard";
import GlowInput from "@/components/ui/GlowInput";
import GlowSelect from "@/components/ui/GlowSelect";
import GlowTextarea from "@/components/ui/GlowTextarea";
import NeonButton from "@/components/ui/NeonButton";

interface Role {
  id: string;
  name: string;
  description?: string | null;
  isActive: boolean;
}

function CollapsibleSection({
  title,
  open: initialOpen = false,
  children,
}: {
  title: string;
  open?: boolean;
  children: React.ReactNode;
}) {
  const [open, setOpen] = useState(initialOpen);
  return (
    <div className="border border-white/10 rounded-xl overflow-hidden">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="w-full px-4 py-3 flex items-center justify-between text-left bg-white/5 hover:bg-white/10 transition-colors"
      >
        <span className="font-medium text-white/90">{title}</span>
        <span className="text-white/60 text-xl leading-none">{open ? "−" : "+"}</span>
      </button>
      {open && <div className="p-4 space-y-4 bg-white/5 border-t border-white/10">{children}</div>}
    </div>
  );
}

export default function StudentProfilePage() {
  const router = useRouter();
  const [roles, setRoles] = useState<Role[]>([]);
  const [name, setName] = useState("");
  const [gender, setGender] = useState("");
  const [college, setCollege] = useState("");
  const [degree, setDegree] = useState("");
  const [branch, setBranch] = useState("");
  const [cgpa, setCgpa] = useState("");
  const [selectedRoles, setSelectedRoles] = useState<string[]>([]);
  const [hasWorkExperience, setHasWorkExperience] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const [fetching, setFetching] = useState(true);

  // Personal
  const [contactNumber, setContactNumber] = useState("");
  const [emailId, setEmailId] = useState("");
  const [age, setAge] = useState("");
  const [location, setLocation] = useState("");
  const [source, setSource] = useState("");
  const [readyToRelocate, setReadyToRelocate] = useState("");
  // Family
  const [fatherName, setFatherName] = useState("");
  const [motherName, setMotherName] = useState("");
  const [brotherName, setBrotherName] = useState("");
  const [sisterName, setSisterName] = useState("");
  const [spouseName, setSpouseName] = useState("");
  const [childrenName, setChildrenName] = useState("");
  // Education
  const [graduation, setGraduation] = useState("");
  const [engineering, setEngineering] = useState("");
  const [masters, setMasters] = useState("");
  const [pgDiploma, setPgDiploma] = useState("");
  const [additionalQualifications, setAdditionalQualifications] = useState("");
  // Professional
  const [presentOrganization, setPresentOrganization] = useState("");
  const [designation, setDesignation] = useState("");
  const [currentJobDetails, setCurrentJobDetails] = useState("");
  const [teamSizeHandled, setTeamSizeHandled] = useState("");
  const [reportingTo, setReportingTo] = useState("");
  const [currentMonthlyCTC, setCurrentMonthlyCTC] = useState("");
  const [currentAnnualCTC, setCurrentAnnualCTC] = useState("");
  const [expectedMonthlyCTC, setExpectedMonthlyCTC] = useState("");
  const [expectedAnnualCTC, setExpectedAnnualCTC] = useState("");
  const [totalExperience, setTotalExperience] = useState("");
  const [noticePeriod, setNoticePeriod] = useState("");
  const [reasonsForChange, setReasonsForChange] = useState("");

  useEffect(() => {
    fetch("/api/student/roles")
      .then((r) => r.json())
      .then((data) => {
        if (Array.isArray(data)) setRoles(data);
        setFetching(false);
      })
      .catch(() => setFetching(false));
  }, []);

  function toggleRole(id: string) {
    setSelectedRoles((prev) => {
      if (prev.includes(id)) return prev.filter((r) => r !== id);
      if (prev.length >= 2) return prev;
      return [...prev, id];
    });
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const cgpaNum = parseFloat(cgpa);
    if (isNaN(cgpaNum) || cgpaNum < 0 || cgpaNum > 10) {
      setError("CGPA must be between 0 and 10");
      return;
    }
    if (selectedRoles.length < 1 || selectedRoles.length > 2) {
      setError("Select 1 or 2 roles");
      return;
    }
    const req = (v: string, msg: string) => { if (!v?.trim()) return msg; return null; };
    if (req(contactNumber, "Contact number required")) { setError("Contact number required"); return; }
    if (req(emailId, "Email ID required")) { setError("Email ID required"); return; }
    if (!age?.trim()) { setError("Age required"); return; }
    const ageNum = parseInt(age, 10);
    if (isNaN(ageNum) || ageNum < 1 || ageNum > 120) { setError("Age must be 1–120"); return; }
    if (req(location, "Location required")) { setError("Location required"); return; }
    if (req(source, "Source required")) { setError("Source required"); return; }
    if (req(readyToRelocate, "Ready to relocate required")) { setError("Ready to relocate required"); return; }
    if (req(fatherName, "Father's name required")) { setError("Father's name required"); return; }
    if (req(motherName, "Mother's name required")) { setError("Mother's name required"); return; }
    if (req(brotherName, "Brother's name required")) { setError("Brother's name required"); return; }
    if (req(sisterName, "Sister's name required")) { setError("Sister's name required"); return; }
    if (req(spouseName, "Spouse's name required")) { setError("Spouse's name required"); return; }
    if (req(childrenName, "Children's name required")) { setError("Children's name required"); return; }
    if (req(graduation, "Graduation required")) { setError("Graduation required"); return; }
    if (req(engineering, "Engineering required")) { setError("Engineering required"); return; }
    if (req(masters, "Masters required")) { setError("Masters required"); return; }
    if (req(pgDiploma, "PG Diploma required")) { setError("PG Diploma required"); return; }
    if (req(additionalQualifications, "Additional qualifications required")) { setError("Additional qualifications required"); return; }
    if (hasWorkExperience) {
      if (req(presentOrganization, "Present organization required")) { setError("Present organization required"); return; }
      if (req(designation, "Designation required")) { setError("Designation required"); return; }
      if (req(currentJobDetails, "Current job details required")) { setError("Current job details required"); return; }
      if (req(teamSizeHandled, "Team size handled required")) { setError("Team size handled required"); return; }
      if (req(reportingTo, "Reporting to required")) { setError("Reporting to required"); return; }
      if (req(currentMonthlyCTC, "Current monthly CTC required")) { setError("Current monthly CTC required"); return; }
      if (req(currentAnnualCTC, "Current annual CTC required")) { setError("Current annual CTC required"); return; }
      if (req(expectedMonthlyCTC, "Expected monthly CTC required")) { setError("Expected monthly CTC required"); return; }
      if (req(expectedAnnualCTC, "Expected annual CTC required")) { setError("Expected annual CTC required"); return; }
      if (req(totalExperience, "Total experience required")) { setError("Total experience required"); return; }
      if (req(noticePeriod, "Notice period required")) { setError("Notice period required"); return; }
      if (req(reasonsForChange, "Reasons for change required")) { setError("Reasons for change required"); return; }
    }
    setError("");
    setLoading(true);
    try {
      const res = await fetch("/api/student/save-profile", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name,
          gender,
          college,
          degree,
          branch,
          cgpa: cgpaNum,
          roleIds: selectedRoles,
          contactNumber: contactNumber.trim(),
          emailId: emailId.trim(),
          age: ageNum,
          location: location.trim(),
          source: source.trim(),
          readyToRelocate: readyToRelocate.trim(),
          fatherName: fatherName.trim(),
          motherName: motherName.trim(),
          brotherName: brotherName.trim(),
          sisterName: sisterName.trim(),
          spouseName: spouseName.trim(),
          childrenName: childrenName.trim(),
          graduation: graduation.trim(),
          engineering: engineering.trim(),
          masters: masters.trim(),
          pgDiploma: pgDiploma.trim(),
          additionalQualifications: additionalQualifications.trim(),
          presentOrganization: hasWorkExperience ? presentOrganization.trim() : "",
          designation: hasWorkExperience ? designation.trim() : "",
          currentJobDetails: hasWorkExperience ? currentJobDetails.trim() : "",
          teamSizeHandled: hasWorkExperience ? teamSizeHandled.trim() : "",
          reportingTo: hasWorkExperience ? reportingTo.trim() : "",
          currentMonthlyCTC: hasWorkExperience ? currentMonthlyCTC.trim() : "",
          currentAnnualCTC: hasWorkExperience ? currentAnnualCTC.trim() : "",
          expectedMonthlyCTC: hasWorkExperience ? expectedMonthlyCTC.trim() : "",
          expectedAnnualCTC: hasWorkExperience ? expectedAnnualCTC.trim() : "",
          totalExperience: hasWorkExperience ? totalExperience.trim() : "",
          noticePeriod: hasWorkExperience ? noticePeriod.trim() : "",
          reasonsForChange: hasWorkExperience ? reasonsForChange.trim() : "",
        }),
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || "Save failed");
        return;
      }
      const startRes = await fetch("/api/student/start-exam", { method: "POST" });
      const startData = await startRes.json();
      if (!startRes.ok) {
        setError(startData.error || "Cannot start exam");
        return;
      }
      router.push("/student/exam");
      router.refresh();
    } catch {
      setError("Something went wrong");
    } finally {
      setLoading(false);
    }
  }

  if (fetching) return <div className="min-h-screen flex items-center justify-center p-8"><span className="text-white/70">Loading...</span></div>;

  return (
    <div className="min-h-screen p-8 max-w-2xl mx-auto">
      <GlassCard className="p-8">
        <h1 className="font-display font-bold text-2xl tracking-head mb-6">Student Profile</h1>
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Required fields - always visible */}
          <div className="space-y-4">
            <h2 className="font-medium text-white/90 text-lg">Basic Information</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">Name *</label>
                <GlowInput value={name} onChange={(e) => setName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Gender *</label>
                <GlowSelect value={gender} onChange={(e) => setGender(e.target.value)} required>
                  <option value="">Select</option>
                  <option value="Male">Male</option>
                  <option value="Female">Female</option>
                  <option value="Other">Other</option>
                </GlowSelect>
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">College Name *</label>
              <GlowInput value={college} onChange={(e) => setCollege(e.target.value)} required />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">Degree Type *</label>
                <GlowInput value={degree} onChange={(e) => setDegree(e.target.value)} placeholder="e.g. B.Tech" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Branch *</label>
                <GlowInput value={branch} onChange={(e) => setBranch(e.target.value)} placeholder="e.g. CSE" required />
              </div>
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-1">CGPA (0-10) *</label>
              <GlowInput type="number" step="0.01" min="0" max="10" value={cgpa} onChange={(e) => setCgpa(e.target.value)} required />
            </div>
            <div>
              <label className="block text-sm text-white/80 mb-2">Roles Applying For (select 1 or 2) *</label>
              {roles.length === 0 ? (
                <p className="text-white/50 text-sm">No roles available. Contact admin.</p>
              ) : (
                <div className="space-y-2">
                  {roles.map((r) => (
                    <label key={r.id} className="flex items-center gap-2 cursor-pointer group p-2 rounded-lg hover:bg-white/5 transition-colors">
                      <input
                        type="checkbox"
                        checked={selectedRoles.includes(r.id)}
                        onChange={() => toggleRole(r.id)}
                        disabled={!selectedRoles.includes(r.id) && selectedRoles.length >= 2}
                        className="w-4 h-4 rounded border-white/30 bg-white/5 text-primary focus:ring-neonBlue focus:ring-offset-0 accent-primary"
                      />
                      <span className={selectedRoles.includes(r.id) ? "text-white" : "text-white/70 group-hover:text-white/90"}>{r.name}</span>
                    </label>
                  ))}
                </div>
              )}
            </div>
          </div>

          <CollapsibleSection title="Personal Details" open>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">Contact Number *</label>
                <GlowInput value={contactNumber} onChange={(e) => setContactNumber(e.target.value)} type="tel" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Email ID *</label>
                <GlowInput value={emailId} onChange={(e) => setEmailId(e.target.value)} type="email" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Age *</label>
                <GlowInput value={age} onChange={(e) => setAge(e.target.value)} type="number" min="1" max="120" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Location *</label>
                <GlowInput value={location} onChange={(e) => setLocation(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Source *</label>
                <GlowInput value={source} onChange={(e) => setSource(e.target.value)} placeholder="e.g. LinkedIn, Referral" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Ready to Relocate *</label>
                <GlowSelect value={readyToRelocate} onChange={(e) => setReadyToRelocate(e.target.value)} required>
                  <option value="">Select</option>
                  <option value="Yes">Yes</option>
                  <option value="No">No</option>
                  <option value="Flexible">Flexible</option>
                </GlowSelect>
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Family Details" open>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">Father&apos;s Name *</label>
                <GlowInput value={fatherName} onChange={(e) => setFatherName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Mother&apos;s Name *</label>
                <GlowInput value={motherName} onChange={(e) => setMotherName(e.target.value)} required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Brother&apos;s Name *</label>
                <GlowInput value={brotherName} onChange={(e) => setBrotherName(e.target.value)} placeholder="N/A if none" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Sister&apos;s Name *</label>
                <GlowInput value={sisterName} onChange={(e) => setSisterName(e.target.value)} placeholder="N/A if none" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Spouse&apos;s Name *</label>
                <GlowInput value={spouseName} onChange={(e) => setSpouseName(e.target.value)} placeholder="N/A if unmarried" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Children&apos;s Name *</label>
                <GlowInput value={childrenName} onChange={(e) => setChildrenName(e.target.value)} placeholder="N/A if none" required />
              </div>
            </div>
          </CollapsibleSection>

          <CollapsibleSection title="Education Details" open>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm text-white/80 mb-1">Graduation *</label>
                <GlowInput value={graduation} onChange={(e) => setGraduation(e.target.value)} placeholder="e.g. B.Tech, B.Sc" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Engineering *</label>
                <GlowInput value={engineering} onChange={(e) => setEngineering(e.target.value)} placeholder="Branch/Stream or N/A" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">Masters *</label>
                <GlowInput value={masters} onChange={(e) => setMasters(e.target.value)} placeholder="e.g. M.Tech, MBA or N/A" required />
              </div>
              <div>
                <label className="block text-sm text-white/80 mb-1">PG Diploma *</label>
                <GlowInput value={pgDiploma} onChange={(e) => setPgDiploma(e.target.value)} placeholder="N/A if none" required />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm text-white/80 mb-1">Additional Qualifications *</label>
                <GlowInput value={additionalQualifications} onChange={(e) => setAdditionalQualifications(e.target.value)} placeholder="N/A if none" required />
              </div>
            </div>
          </CollapsibleSection>

          <div>
            <label className="flex items-center gap-2 cursor-pointer p-2 rounded-lg hover:bg-white/5 transition-colors">
              <input
                type="checkbox"
                checked={hasWorkExperience}
                onChange={(e) => setHasWorkExperience(e.target.checked)}
                className="w-4 h-4 rounded border-white/30 bg-white/5 text-primary focus:ring-neonBlue accent-primary"
              />
              <span className="text-white/90">Do you have prior work experience?</span>
            </label>
          </div>

          {hasWorkExperience && (
            <CollapsibleSection title="Professional Details" open>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-white/80 mb-1">Present Organization *</label>
                  <GlowInput value={presentOrganization} onChange={(e) => setPresentOrganization(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Designation *</label>
                  <GlowInput value={designation} onChange={(e) => setDesignation(e.target.value)} required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-white/80 mb-1">Current Job Details *</label>
                  <GlowTextarea value={currentJobDetails} onChange={(e) => setCurrentJobDetails(e.target.value)} rows={3} required />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Team Size Handled *</label>
                  <GlowInput value={teamSizeHandled} onChange={(e) => setTeamSizeHandled(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Reporting To *</label>
                  <GlowInput value={reportingTo} onChange={(e) => setReportingTo(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Current Monthly CTC *</label>
                  <GlowInput value={currentMonthlyCTC} onChange={(e) => setCurrentMonthlyCTC(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Current Annual CTC *</label>
                  <GlowInput value={currentAnnualCTC} onChange={(e) => setCurrentAnnualCTC(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Expected Monthly CTC *</label>
                  <GlowInput value={expectedMonthlyCTC} onChange={(e) => setExpectedMonthlyCTC(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Expected Annual CTC *</label>
                  <GlowInput value={expectedAnnualCTC} onChange={(e) => setExpectedAnnualCTC(e.target.value)} required />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Total Experience *</label>
                  <GlowInput value={totalExperience} onChange={(e) => setTotalExperience(e.target.value)} placeholder="e.g. 3 years" required />
                </div>
                <div>
                  <label className="block text-sm text-white/80 mb-1">Notice Period *</label>
                  <GlowInput value={noticePeriod} onChange={(e) => setNoticePeriod(e.target.value)} placeholder="e.g. 30 days" required />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-sm text-white/80 mb-1">Reasons for Change *</label>
                  <GlowTextarea value={reasonsForChange} onChange={(e) => setReasonsForChange(e.target.value)} rows={3} required />
                </div>
              </div>
            </CollapsibleSection>
          )}

          {error && <p className="text-red-400 text-sm">{error}</p>}
          <NeonButton type="submit" disabled={loading || roles.length === 0} className="w-full">
            {loading ? "Saving..." : "Save & Start Exam"}
          </NeonButton>
        </form>
      </GlassCard>
    </div>
  );
}
