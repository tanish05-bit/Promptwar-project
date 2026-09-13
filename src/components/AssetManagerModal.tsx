import React, { useState, useRef, useEffect } from 'react';
import { ProjectAsset } from '../types';

interface AssetManagerModalProps {
  isOpen: boolean;
  onClose: () => void;
  projectHtml: string;
  onUpdateHtml: (newHtml: string) => void;
  showToast: (msg: string) => void;
}

export const AssetManagerModal: React.FC<AssetManagerModalProps> = ({
  isOpen,
  onClose,
  projectHtml,
  onUpdateHtml,
  showToast,
}) => {
  const [assets, setAssets] = useState<ProjectAsset[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAsset, setSelectedAsset] = useState<ProjectAsset | null>(null);
  const [targetImageUrl, setTargetImageUrl] = useState<string>('');
  const [isReplacing, setIsReplacing] = useState(false);

  const fileInputRef = useRef<HTMLInputElement>(null);

  // Fetch project assets
  useEffect(() => {
    if (!isOpen) return;
    const fetchAssets = async () => {
      setIsLoading(true);
      try {
        const res = await fetch('/api/assets');
        const data = await res.json();
        if (Array.isArray(data)) setAssets(data);
      } catch (err) {
        console.error(err);
      } finally {
        setIsLoading(false);
      }
    };
    fetchAssets();
  }, [isOpen]);

  if (!isOpen) return null;

  // Extract all existing img src urls from the website HTML
  const existingImages: string[] = [];
  const imgRegex = /<img[^>]+src="([^">]+)"/gi;
  let match;
  while ((match = imgRegex.exec(projectHtml)) !== null) {
    if (!existingImages.includes(match[1])) {
      existingImages.push(match[1]);
    }
  }

  // Handle uploading custom asset
  const handleUploadAsset = (file: File) => {
    const reader = new FileReader();
    reader.onload = async () => {
      const dataUrl = reader.result as string;
      try {
        const res = await fetch('/api/assets', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            name: file.name,
            url: dataUrl,
            type: 'image',
            size: `${(file.size / 1024).toFixed(1)} KB`,
          }),
        });
        const newAsset = await res.json();
        if (newAsset && newAsset.id) {
          setAssets((prev) => [newAsset, ...prev]);
          showToast(`Asset "${file.name}" uploaded to library`);
        }
      } catch (e) {
        console.error(e);
        showToast('Failed to upload asset');
      }
    };
    reader.readAsDataURL(file);
  };

  // Replace image in HTML directly
  const handleReplaceImageInHtml = (assetUrl: string) => {
    if (!targetImageUrl) {
      showToast('Select an image from the website to replace.');
      return;
    }

    const updatedHtml = projectHtml.replaceAll(targetImageUrl, assetUrl);
    onUpdateHtml(updatedHtml);
    setTargetImageUrl(assetUrl);
    showToast('Replaced image in website HTML!');
  };

  const handleDeleteAsset = async (id: string) => {
    try {
      await fetch(`/api/assets/${id}`, { method: 'DELETE' });
      setAssets((prev) => prev.filter((a) => a.id !== id));
      if (selectedAsset?.id === id) setSelectedAsset(null);
      showToast('Asset removed');
    } catch (e) {
      console.error(e);
    }
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
      <div className="bg-[#1b1b1d] border border-[#2e2d35] rounded-2xl max-w-2xl w-full p-6 shadow-2xl animate-fade-in flex flex-col gap-5 my-8">
        {/* Header */}
        <div className="flex items-center justify-between border-b border-[#2e2d35] pb-3">
          <div className="flex items-center gap-2.5">
            <span className="material-symbols-outlined text-[#ffb68c] text-[22px]">
              photo_library
            </span>
            <div>
              <h2 className="font-serif font-semibold text-base text-[#f0ede6]">
                Asset Library & Image Manager
              </h2>
              <p className="text-xs text-[#a38c80]">
                Upload, replace, and associate graphics directly with website sections
              </p>
            </div>
          </div>
          <button onClick={onClose} className="text-[#a38c80] hover:text-[#f0ede6] p-1 rounded">
            ✕
          </button>
        </div>

        {/* Upload Action Row */}
        <div className="flex items-center justify-between gap-3 bg-[#131315] p-3 rounded-xl border border-[#2e2d35]">
          <div className="text-xs text-[#dbc1b4]">
            Add high-resolution screenshots, icons, or photos to this project:
          </div>
          <button
            onClick={() => fileInputRef.current?.click()}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-[#d97736] text-[#161618] text-xs font-semibold hover:bg-[#e5a968] transition-all"
          >
            <span className="material-symbols-outlined text-[16px]">upload</span>
            <span>Upload Asset</span>
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*"
            onChange={(e) => {
              if (e.target.files && e.target.files[0]) {
                handleUploadAsset(e.target.files[0]);
              }
            }}
            className="hidden"
          />
        </div>

        {/* Replace Image in Component Helper */}
        {existingImages.length > 0 && (
          <div className="bg-[#161618] p-3 rounded-xl border border-[#2e2d35] flex flex-col gap-2">
            <div className="text-xs font-semibold text-[#f0ede6] flex items-center gap-1.5">
              <span className="material-symbols-outlined text-[#ffb68c] text-[16px]">swap_horiz</span>
              <span>Direct In-Component Image Replacement</span>
            </div>
            <p className="text-[11px] text-[#a38c80]">
              Select an image currently rendered in the website to swap with a new asset:
            </p>
            <div className="flex items-center gap-2">
              <select
                value={targetImageUrl}
                onChange={(e) => setTargetImageUrl(e.target.value)}
                className="flex-1 bg-[#1e1e22] text-[#f0ede6] text-xs p-2 rounded-lg border border-[#2e2d35] truncate"
              >
                <option value="">-- Choose image in website to replace --</option>
                {existingImages.map((src, idx) => (
                  <option key={idx} value={src}>
                    {src.slice(0, 50)}...
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

        {/* Asset Cards Grid */}
        <div>
          <label className="block text-xs font-semibold text-[#dbc1b4] mb-2">
            Available Media Assets ({assets.length})
          </label>

          {isLoading ? (
            <div className="p-8 text-center text-xs text-[#a38c80]">Loading assets...</div>
          ) : assets.length === 0 ? (
            <div className="p-8 text-center text-xs text-[#a38c80] bg-[#131315] rounded-xl border border-[#2e2d35]">
              No custom assets yet. Upload photos, illustrations, or icons above.
            </div>
          ) : (
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-3 max-h-72 overflow-y-auto pr-1">
              {assets.map((asset) => (
                <div
                  key={asset.id}
                  className={`bg-[#131315] border rounded-xl p-2.5 flex flex-col justify-between transition-all ${
                    selectedAsset?.id === asset.id
                      ? 'border-[#ffb68c] shadow-md'
                      : 'border-[#2e2d35] hover:border-[#a38c80]'
                  }`}
                >
                  <div className="relative w-full h-24 bg-[#1e1e22] rounded-lg overflow-hidden mb-2 flex items-center justify-center">
                    <img
                      src={asset.url}
                      alt={asset.name}
                      className="w-full h-full object-cover"
                    />
                  </div>

                  <div className="truncate mb-2">
                    <div className="text-xs font-semibold text-[#f0ede6] truncate">
                      {asset.name}
                    </div>
                    <div className="text-[10px] text-[#a38c80] font-mono">{asset.size || 'Web'}</div>
                  </div>

                  <div className="flex items-center justify-between gap-1 pt-2 border-t border-[#2e2d35]">
                    <button
                      onClick={() => {
                        navigator.clipboard.writeText(asset.url);
                        showToast('Asset URL copied');
                      }}
                      className="text-[10px] text-[#a38c80] hover:text-[#ffb68c] px-1.5 py-0.5 rounded bg-[#1e1e22]"
                      title="Copy URL"
                    >
                      Copy URL
                    </button>

                    {targetImageUrl && (
                      <button
                        onClick={() => handleReplaceImageInHtml(asset.url)}
                        className="text-[10px] text-[#161618] font-semibold bg-[#ffb68c] hover:bg-[#e5a968] px-2 py-0.5 rounded"
                        title="Replace chosen website image with this one"
                      >
                        Replace
                      </button>
                    )}

                    <button
                      onClick={() => handleDeleteAsset(asset.id)}
                      className="text-[#a38c80] hover:text-[#ffb4ab] p-1 rounded"
                      title="Delete asset"
                    >
                      <span className="material-symbols-outlined text-[14px]">delete</span>
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-end pt-3 border-t border-[#2e2d35]">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-lg text-xs text-[#a38c80] hover:text-[#f0ede6]"
          >
            Done
          </button>
        </div>
      </div>
    </div>
  );
};
