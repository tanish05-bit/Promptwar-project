import React, { useState } from 'react';
import { WebsiteProject } from '../types';

interface ExportProjectModalProps {
  isOpen: boolean;
  onClose: () => void;
  project: WebsiteProject;
  showToast: (msg: string) => void;
}

export const ExportProjectModal: React.FC<ExportProjectModalProps> = ({
  isOpen,
  onClose,
  project,
  showToast,
}) => {
  const [activeTab, setActiveTab] = useState<'zip' | 'individual' | 'copy' | 'github'>('zip');
  const [isExportingZip, setIsExportingZip] = useState(false);
  const [repoName, setRepoName] = useState(
    project.title.toLowerCase().replace(/[^a-z0-9-_]/g, '-') || 'scholar-web-app'
  );
  const [repoDesc, setRepoDesc] = useState(
    'Interactive web project synthesized with Google AI Studio & Scholar Codex.'
  );
  const [isPrivateRepo, setIsPrivateRepo] = useState(false);
  const [githubExportResult, setGithubExportResult] = useState<any>(null);
  const [isExportingGithub, setIsExportingGithub] = useState(false);

  if (!isOpen) return null;

  // 1. Download Individual Files
  const downloadFile = (filename: string, content: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
    showToast(`Downloaded ${filename}`);
  };

  // 2. Download Complete Project as ZIP
  const handleDownloadZip = async () => {
    setIsExportingZip(true);
    showToast('Compiling ZIP archive...');
    try {
      const res = await fetch('/api/export/zip', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          title: project.title,
          html: project.html,
          css: project.css,
          js: project.js,
          readme: `# ${project.title}\n\n${project.description || 'Web project generated with Scholar Codex & Google AI Studio.'}\n\n## Project Files\n- \`index.html\`: Complete semantic HTML5 structure\n- \`style.css\`: Modern responsive CSS styling\n- \`script.js\`: Client-side interactive logic\n\n## Launch Locally\nOpen \`index.html\` directly in any web browser or serve with: \`npx serve\`\n`,
        }),
      });

      if (!res.ok) throw new Error('ZIP generation failed');

      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `${project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}.zip`;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);
      URL.revokeObjectURL(url);
      showToast('Downloaded project ZIP package!');
    } catch (err: any) {
      console.error(err);
      showToast('Failed to download ZIP archive');
    } finally {
      setIsExportingZip(false);
    }
  };

  // 3. GitHub Export Handler
  const handleGithubExport = async () => {
    setIsExportingGithub(true);
    try {
      const res = await fetch('/api/export/github', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          repoName,
          description: repoDesc,
          isPrivate: isPrivateRepo,
          html: project.html,
          css: project.css,
          js: project.js,
        }),
      });

      const data = await res.json();
      setGithubExportResult(data);
      showToast('GitHub repository structure prepared!');
    } catch (err) {
      console.error(err);
      showToast('Failed to prepare GitHub export');
    } finally {
      setIsExportingGithub(false);
    }
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    showToast(`Copied ${label} to clipboard!`);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1b1b1d] border border-[#2e2d35] rounded-2xl max-w-xl w-full p-6 shadow-2xl animate-fade-in flex flex-col gap-5 my-8">
        {/* Modal Header */}
        <div className="flex items-center justify-between border-b border-[#2e2d35] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ffb68c] text-[22px]">
              download
            </span>
            <div>
              <h2 className="font-serif font-semibold text-base text-[#f0ede6]">
                Export Web Project
              </h2>
              <p className="text-xs text-[#a38c80]">
                Download code files, ZIP archive, or export directly to GitHub
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#a38c80] hover:text-[#f0ede6] p-1 rounded">
            ✕
          </button>
        </div>

        {/* Tab Navigation */}
        <div className="flex items-center gap-1 bg-[#131315] p-1 rounded-xl border border-[#2e2d35]">
          <button
            onClick={() => setActiveTab('zip')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'zip'
                ? 'bg-[#26252b] text-[#ffb68c] shadow-sm font-semibold'
                : 'text-[#a38c80] hover:text-[#f0ede6]'
            }`}
          >
            📦 ZIP Archive
          </button>
          <button
            onClick={() => setActiveTab('individual')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'individual'
                ? 'bg-[#26252b] text-[#ffb68c] shadow-sm font-semibold'
                : 'text-[#a38c80] hover:text-[#f0ede6]'
            }`}
          >
            📄 Single Files
          </button>
          <button
            onClick={() => setActiveTab('copy')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'copy'
                ? 'bg-[#26252b] text-[#ffb68c] shadow-sm font-semibold'
                : 'text-[#a38c80] hover:text-[#f0ede6]'
            }`}
          >
            📋 Copy Code
          </button>
          <button
            onClick={() => setActiveTab('github')}
            className={`flex-1 py-1.5 px-3 rounded-lg text-xs font-medium transition-all ${
              activeTab === 'github'
                ? 'bg-[#26252b] text-[#ffb68c] shadow-sm font-semibold'
                : 'text-[#a38c80] hover:text-[#f0ede6]'
            }`}
          >
            🐙 GitHub
          </button>
        </div>

        {/* Tab Content */}
        <div className="min-h-[220px]">
          {/* TAB 1: Complete ZIP Archive */}
          {activeTab === 'zip' && (
            <div className="flex flex-col gap-4">
              <div className="bg-[#131315] p-4 rounded-xl border border-[#2e2d35] flex items-start gap-3">
                <span className="material-symbols-outlined text-[#ffb68c] text-[32px] mt-1">
                  folder_zip
                </span>
                <div>
                  <h3 className="text-sm font-semibold text-[#f0ede6] mb-1">
                    Complete Production Package (.zip)
                  </h3>
                  <p className="text-xs text-[#a38c80] leading-relaxed">
                    Includes formatted <code className="text-[#ffb68c]">index.html</code>,{' '}
                    <code className="text-[#ffb68c]">style.css</code>,{' '}
                    <code className="text-[#ffb68c]">script.js</code>, and a curated{' '}
                    <code className="text-[#ffb68c]">README.md</code> ready for immediate deployment.
                  </p>
                </div>
              </div>

              <div className="bg-[#131315] p-3 rounded-xl border border-[#2e2d35] font-mono text-xs text-[#dbc1b4] space-y-1">
                <div className="text-[11px] text-[#a38c80] mb-1 uppercase tracking-wider">
                  Archive Contents:
                </div>
                <div>📁 {project.title.toLowerCase().replace(/[^a-z0-9]+/g, '-')}/</div>
                <div className="pl-4">├── 📄 index.html ({Math.round(project.html.length / 1024)} KB)</div>
                <div className="pl-4">├── 🎨 style.css ({Math.round(project.css.length / 1024)} KB)</div>
                <div className="pl-4">├── ⚡ script.js ({Math.round(project.js.length / 1024)} KB)</div>
                <div className="pl-4">└── 📝 README.md</div>
              </div>

              <button
                onClick={handleDownloadZip}
                disabled={isExportingZip}
                className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-[#d97736] text-[#161618] text-xs font-semibold hover:bg-[#e5a968] transition-all shadow-lg"
              >
                {isExportingZip ? (
                  <>
                    <span className="w-4 h-4 border-2 border-[#161618] border-t-transparent rounded-full animate-spin"></span>
                    <span>Building ZIP Archive...</span>
                  </>
                ) : (
                  <>
                    <span className="material-symbols-outlined text-[18px]">download</span>
                    <span>Download Complete ZIP Archive</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* TAB 2: Individual File Downloads */}
          {activeTab === 'individual' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[#a38c80]">
                Download files separately for manual integration into existing projects:
              </p>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div className="bg-[#131315] border border-[#2e2d35] rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#ffb68c] font-semibold block mb-1">
                      HTML5
                    </span>
                    <span className="text-xs text-[#a38c80] block">index.html</span>
                  </div>
                  <button
                    onClick={() => downloadFile('index.html', project.html, 'text/html')}
                    className="mt-4 w-full py-1.5 rounded-lg bg-[#26252b] text-[#f0ede6] hover:text-[#ffb68c] border border-[#2e2d35] text-xs font-medium"
                  >
                    Download HTML
                  </button>
                </div>

                <div className="bg-[#131315] border border-[#2e2d35] rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#8ed5b4] font-semibold block mb-1">
                      CSS3
                    </span>
                    <span className="text-xs text-[#a38c80] block">style.css</span>
                  </div>
                  <button
                    onClick={() => downloadFile('style.css', project.css, 'text/css')}
                    className="mt-4 w-full py-1.5 rounded-lg bg-[#26252b] text-[#f0ede6] hover:text-[#ffb68c] border border-[#2e2d35] text-xs font-medium"
                  >
                    Download CSS
                  </button>
                </div>

                <div className="bg-[#131315] border border-[#2e2d35] rounded-xl p-4 flex flex-col justify-between">
                  <div>
                    <span className="text-xs font-mono text-[#f9ba78] font-semibold block mb-1">
                      JavaScript
                    </span>
                    <span className="text-xs text-[#a38c80] block">script.js</span>
                  </div>
                  <button
                    onClick={() => downloadFile('script.js', project.js, 'application/javascript')}
                    className="mt-4 w-full py-1.5 rounded-lg bg-[#26252b] text-[#f0ede6] hover:text-[#ffb68c] border border-[#2e2d35] text-xs font-medium"
                  >
                    Download JS
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 3: Copy Code to Clipboard */}
          {activeTab === 'copy' && (
            <div className="flex flex-col gap-3">
              <p className="text-xs text-[#a38c80]">
                Copy code snippets directly to your clipboard:
              </p>

              <div className="space-y-2">
                <div className="bg-[#131315] p-3 rounded-xl border border-[#2e2d35] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#f0ede6]">HTML Document</div>
                    <div className="text-[11px] font-mono text-[#a38c80]">
                      {project.html.length} characters
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(project.html, 'HTML')}
                    className="px-3 py-1.5 rounded-lg bg-[#26252b] text-[#dbc1b4] hover:text-[#ffb68c] border border-[#2e2d35] text-xs font-medium flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Copy HTML</span>
                  </button>
                </div>

                <div className="bg-[#131315] p-3 rounded-xl border border-[#2e2d35] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#f0ede6]">CSS Stylesheet</div>
                    <div className="text-[11px] font-mono text-[#a38c80]">
                      {project.css.length} characters
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(project.css, 'CSS')}
                    className="px-3 py-1.5 rounded-lg bg-[#26252b] text-[#dbc1b4] hover:text-[#ffb68c] border border-[#2e2d35] text-xs font-medium flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Copy CSS</span>
                  </button>
                </div>

                <div className="bg-[#131315] p-3 rounded-xl border border-[#2e2d35] flex items-center justify-between">
                  <div>
                    <div className="text-xs font-semibold text-[#f0ede6]">JavaScript Logic</div>
                    <div className="text-[11px] font-mono text-[#a38c80]">
                      {project.js.length} characters
                    </div>
                  </div>
                  <button
                    onClick={() => copyToClipboard(project.js, 'JavaScript')}
                    className="px-3 py-1.5 rounded-lg bg-[#26252b] text-[#dbc1b4] hover:text-[#ffb68c] border border-[#2e2d35] text-xs font-medium flex items-center gap-1.5"
                  >
                    <span className="material-symbols-outlined text-[15px]">content_copy</span>
                    <span>Copy JS</span>
                  </button>
                </div>
              </div>
            </div>
          )}

          {/* TAB 4: GitHub Integration */}
          {activeTab === 'github' && (
            <div className="flex flex-col gap-4">
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-[#dbc1b4] mb-1">
                    Repository Name
                  </label>
                  <input
                    type="text"
                    value={repoName}
                    onChange={(e) => setRepoName(e.target.value)}
                    className="w-full bg-[#131315] text-[#f0ede6] text-xs p-2.5 rounded-xl border border-[#2e2d35] focus:outline-none focus:border-[#ffb68c] font-mono"
                    placeholder="my-scholar-project"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-[#dbc1b4] mb-1">
                    Repository Description
                  </label>
                  <input
                    type="text"
                    value={repoDesc}
                    onChange={(e) => setRepoDesc(e.target.value)}
                    className="w-full bg-[#131315] text-[#f0ede6] text-xs p-2.5 rounded-xl border border-[#2e2d35] focus:outline-none focus:border-[#ffb68c]"
                  />
                </div>

                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    id="privateCheck"
                    checked={isPrivateRepo}
                    onChange={(e) => setIsPrivateRepo(e.target.checked)}
                    className="accent-[#d97736]"
                  />
                  <label htmlFor="privateCheck" className="text-xs text-[#a38c80]">
                    Create as Private Repository
                  </label>
                </div>
              </div>

              {githubExportResult ? (
                <div className="bg-[#131315] p-3 rounded-xl border border-[#8ed5b4]/40 font-mono text-xs space-y-2">
                  <div className="text-[#8ed5b4] font-semibold flex items-center gap-1">
                    <span className="material-symbols-outlined text-[16px]">check_circle</span>
                    <span>{githubExportResult.message}</span>
                  </div>
                  <p className="text-[11px] text-[#a38c80]">Run in your project directory:</p>
                  <pre className="bg-[#0e0e10] p-2 rounded text-[11px] text-[#ffb68c] overflow-x-auto">
                    {githubExportResult.instructions?.join('\n')}
                  </pre>
                </div>
              ) : (
                <button
                  onClick={handleGithubExport}
                  disabled={isExportingGithub || !repoName.trim()}
                  className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-[#26252b] text-[#f0ede6] hover:border-[#ffb68c] border border-[#2e2d35] text-xs font-semibold transition-all"
                >
                  <span className="material-symbols-outlined text-[16px]">cloud_upload</span>
                  <span>Prepare GitHub Repository Payload</span>
                </button>
              )}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-[#2e2d35]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-[#a38c80] hover:text-[#f0ede6]"
          >
            Close
          </button>
        </div>
      </div>
    </div>
  );
};
