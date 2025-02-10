import { useCallback, useState } from "preact/hooks";
import Dialog from "./dialog";
import "./user-settings.css";
import { MemberProfile } from "../util/types";
import { ChangeEvent } from "preact/compat";
import classnames from "../util/classnames";
import { authState } from "../util/state";
import { useAsync } from "../hooks/useAsync";
import { updateOwnProfile } from "../util/firebase";

const CHARACTERS = [
  "mario",
  "ash",
  "pokeball",
  "bulbasaur",
  "charmander",
  "squirtle",
  "kirby",
];

function UserSettings() {
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const { user } = authState.value;
  const [userProfileState, setUserProfile] = useState<MemberProfile>({
    character: user?.photoURL ?? "",
    displayName: user?.displayName ?? "",
  });

  const { invoke: saveUserSettings, isFetching: isUserSettingsSaving } =
    useAsync((profile: MemberProfile) => updateOwnProfile(profile));

  const handleClickSettings = useCallback(() => {
    setIsSettingsOpen((isOpen) => !isOpen);
  }, [setIsSettingsOpen]);

  const handleSaveSettings = useCallback(
    (e?: any) => {
      e?.preventDefault();
      setIsSettingsOpen(false);
      saveUserSettings(userProfileState);
    },
    [userProfileState],
  );

  const handleChangeDisplayName = useCallback(
    (e: ChangeEvent<HTMLInputElement>) => {
      const { value } = e.currentTarget;
      setUserProfile((state) => ({
        ...state,
        displayName: value,
      }));
    },
    [setUserProfile],
  );

  const handleClickCharacter = (character: string) => () => {
    setUserProfile((state) => ({
      ...state,
      character,
    }));
  };

  return (
    <div className="user-settings-container">
      <button
        disabled={!authState.value.user?.uid || isUserSettingsSaving}
        onClick={handleClickSettings}
        className="nes-badge"
      >
        <span className="is-warning">Settings</span>
      </button>

      <Dialog
        isOpen={isSettingsOpen}
        title="Settings"
        onCancel={handleClickSettings}
        onConfirm={handleSaveSettings}
      >
        <form onSubmit={handleSaveSettings}>
          <div class="nes-field">
            <label for="name">Your name</label>
            <input
              onChange={handleChangeDisplayName}
              type="text"
              id="name"
              class="nes-input"
              value={userProfileState.displayName}
            />
          </div>
          <div>
            <label>Select character</label>
            <section class="icon-list">
              {CHARACTERS.map((character) => (
                <i
                  key={character}
                  onClick={handleClickCharacter(character)}
                  class={classnames(
                    `nes-${character}`,
                    userProfileState.character === character &&
                      "character-is-selected",
                  )}
                ></i>
              ))}
            </section>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default UserSettings;
