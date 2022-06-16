import { FontAwesomeIcon } from '@fortawesome/react-fontawesome'
import { faCog } from '@fortawesome/free-solid-svg-icons'

import React, { useState } from "react";
import Button from "./Button";
import Modal from './Modal';

const SettingsModal: React.FC<{ show: boolean, onClose: () => void }> = ({ show, onClose }) => {
  return (
    <Modal show={show} onHide={onClose}>
      <h3>Configurações</h3>

      <div>
        <label htmlFor="mute">Desativar sons</label>

        <input
          type="checkbox"
          id="mute"
          name="mute"
          onChange={event => window.localStorage.setItem("mute", event.target.checked ? "true" : "false")}
          checked={window.localStorage.getItem("mute") === "true"}
        />
      </div>
    </Modal>
  )
}

const Settings: React.FC = () => {
  const [showSettings, setShowSettings] = useState(false);

  return (
    <>
      <Button onClick={() => setShowSettings(true)}>
        <FontAwesomeIcon icon={faCog} />
      </Button>

      <SettingsModal show={showSettings} onClose={() => setShowSettings(false)} />
    </>
  )
}

export default Settings;
