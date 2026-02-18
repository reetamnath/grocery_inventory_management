import { useState, useEffect } from "react";
import { Modal, Button } from "@/components/common";
import { useConfig } from "@/context";
import { useToast } from "@/components/common";

interface ConfigModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function ConfigModal({ isOpen, onClose }: ConfigModalProps) {
  const { scriptUrl, setScriptUrl } = useConfig();
  const { showToast } = useToast();
  const [url, setUrl] = useState(scriptUrl);
  const [error, setError] = useState("");

  useEffect(() => {
    if (isOpen) {
      setUrl(scriptUrl);
      setError("");
    }
  }, [isOpen, scriptUrl]);

  const handleSave = () => {
    const trimmedUrl = url.trim();
    if (!trimmedUrl) {
      setError("Please enter the script URL");
      return;
    }

    setScriptUrl(trimmedUrl);
    showToast("Configuration saved", "success");
    onClose();
  };

  const footer = (
    <>
      <Button onClick={onClose}>Cancel</Button>
      <Button variant="primary" onClick={handleSave}>
        <i className="fas fa-save"></i> Save Configuration
      </Button>
    </>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={
        <>
          <i className="fas fa-cog"></i> Configuration
        </>
      }
      footer={footer}
    >
      <div className="config-section">
        <h3>Google Apps Script Web App URL</h3>
        <p>Enter the URL of your deployed Google Apps Script web app</p>
        <input
          type="url"
          className="config-input"
          placeholder="https://script.google.com/macros/s/YOUR_SCRIPT_ID/exec"
          value={url}
          onChange={(e) => {
            setUrl(e.target.value);
            setError("");
          }}
        />
        {error && <p className="config-error">{error}</p>}
      </div>

      <div className="config-section">
        <h3>Column Configuration</h3>
        <p>
          Your sheet should have these columns: Item Name, Category, Stock
          Status, Quantity, Unit, Last Updated, Notes
        </p>
      </div>
    </Modal>
  );
}
