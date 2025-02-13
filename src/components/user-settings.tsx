import { useCallback, useState } from "preact/hooks";
import Dialog from "./dialog";
import "./user-settings.css";
import { MemberProfile } from "../util/types";
import { ChangeEvent } from "preact/compat";
import classnames from "../util/classnames";
import { authState } from "../util/state";
import { useAsync } from "../hooks/useAsync";
import { updateOwnProfile } from "../util/firebase";
import { CardColor } from "./card";

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
  const { user, cardColor, requireUserSetting } = authState.value;
  const [_isSettingsOpen, setIsSettingsOpen] = useState(false);
  const isSettingsOpen = _isSettingsOpen || Boolean(requireUserSetting);
  const [userProfileState, setUserProfile] = useState<MemberProfile>({
    displayName: user?.displayName ?? "",
    character: user?.photoURL ?? "",
    cardColor,
  });

  const { invoke: saveUserSettings, isFetching: isUserSettingsSaving } =
    useAsync((profile: MemberProfile) => updateOwnProfile(profile));

  const handleClickSettings = useCallback(() => {
    setIsSettingsOpen((isOpen) => !isOpen);
  }, [setIsSettingsOpen]);

  const handleCancelSettings = useCallback(() => {
    setIsSettingsOpen(false);
    requireUserSetting?.onCancel?.();
  }, [setIsSettingsOpen]);

  const handleSaveSettings = useCallback(
    (e?: any) => {
      e?.preventDefault();
      setIsSettingsOpen(false);
      saveUserSettings(userProfileState);
      requireUserSetting?.onConfirm?.();
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

  const handleClickColor = (color: CardColor) => () => {
    setUserProfile((state) => ({
      ...state,
      cardColor: color,
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
        title={
          requireUserSetting ? "Please enter your name and confirm" : "Settings"
        }
        onCancel={handleCancelSettings}
        onConfirm={handleSaveSettings}
        disabledCancel={Boolean(requireUserSetting)}
        disabledConfirm={!userProfileState.displayName}
        className="user-settings-dialog"
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
          <div>
            <label>Select suit</label>
            <section className="settings-colors-container">
              {Object.values(CardColor)
                .filter((v): v is CardColor => !isNaN(Number(v)))
                .map((color: CardColor) => (
                  <div className="nes-container is-centered settings-color-box">
                    <button
                      type="button"
                      className={classnames(
                        "nes-btn",
                        `settings-color-box-${CardColor[color].toLowerCase()}`,
                        userProfileState.cardColor === color && "is-disabled",
                      )}
                      disabled={userProfileState.cardColor === color}
                      onClick={handleClickColor(color)}
                    ></button>
                  </div>
                ))}
            </section>
          </div>
        </form>
      </Dialog>
    </div>
  );
}

export default UserSettings;
