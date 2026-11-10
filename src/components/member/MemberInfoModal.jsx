import { verifyBeforeUpdateEmail } from "firebase/auth";
import { useEffect, useId, useRef, useState } from "react";
import { SnsConnectionModal } from "./SnsConnectionModal";
import { WavveAccountModal } from "../common/WavveAccountModal";
import { Link } from "react-router-dom";
import { doc, getDoc, setDoc, serverTimestamp } from "firebase/firestore";
import { auth, db } from "../../firebase/firebase";
import { useAuthState } from "../../hooks/useAuthState";
import "../../styles/pages/member/MemberInfoModal.scss";

const consentLabels = [
  ["marketing", "마케팅 및 이벤트 개인정보 수집·이용 동의 (선택)"],
  ["personalizedAds", "맞춤형 광고 설정 활성화 (선택)"],
  ["promotions", "광고성 정보 수신 동의 (선택)"],
  ["email", "이메일 수신 동의 (선택)"],
  ["sms", "SMS 수신 동의 (선택)"],
];
const emptyForm = { name: "", gender: "", birthday: "", phone: "", consents: {} };
const asText = value => typeof value === "string" ? value : "";

export function MemberInfoModal({ onClose }) {
  const { user, loading: authLoading } = useAuthState();
  const submitting = useRef(false);
  const id = useId();
  const [form, setForm] = useState(emptyForm);
  const [loadedUid, setLoadedUid] = useState(null);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [saved, setSaved] = useState(false);
  const [newEmail, setNewEmail] = useState("");
  const [emailMessage, setEmailMessage] = useState("");
  const [snsOwnerId, setSnsOwnerId] = useState(null);


  useEffect(() => {
    let active = true;
    setLoadedUid(null);
    setForm(emptyForm);
    setError("");
    setSaved(false);
    if (authLoading) return () => { active = false; };
    if (!user) {
      setLoading(false);
      return () => { active = false; };
    }
    setLoading(true);
    getDoc(doc(db, "users", user.uid)).then(snapshot => {
      if (!active) return;
      const data = snapshot.data() || {};
      const info = data.memberInfo || {};

      const firstText = (...values) =>
        values.find(
          (value) => typeof value === "string" && value.trim()
        )?.trim() || "";

      const genderValue = firstText(info.gender, data.gender);

      const genderMap = {
        male: "male",
        female: "female",
        other: "other",
        남성: "male",
        여성: "female",
        남자: "male",
        여자: "female",
        기타: "other",
        M: "male",
        F: "female",
      };

      const birthdayValue = firstText(
        info.birthday,
        data.birthday,
        data.birthDate
      );

      const normalizedBirthday = birthdayValue
        .replace(/[./]/g, "-")
        .replace(/^(\d{4})(\d{2})(\d{2})$/, "$1-$2-$3");

      setForm({
        name: firstText(
          info.name,
          data.name,
          data.displayName,
          user.displayName
        ),

        gender: genderMap[genderValue] || "",

        birthday: /^\d{4}-\d{2}-\d{2}$/.test(normalizedBirthday)
          ? normalizedBirthday
          : "",

        phone: asText(
          info.phone ??
          data.phone ??
          data.phoneNumber ??
          user.phoneNumber
        ),

        consents: Object.fromEntries(
          consentLabels.map(([key]) => [
            key,
            (info.consents?.[key] ?? data.consents?.[key]) === true,
          ])
        ),
      });

      setLoadedUid(user.uid);
    }).catch(() => {
      if (active) setError("회원정보를 불러오지 못했어요. 창을 닫고 다시 열어주세요.");
    }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [user, authLoading]);

  useEffect(() => {
    setNewEmail(user?.email || "");
    setEmailMessage("");
  }, [user?.uid, user?.email]);

  const updateField = event => {
    setForm(previous => ({ ...previous, [event.target.name]: event.target.value }));
    setSaved(false);
  };
  const save = async event => {
    event.preventDefault();
    if (submitting.current || loading || !loadedUid || auth.currentUser?.uid !== loadedUid) return;
    const name = form.name.trim();
    if (!name) { setError("이름을 입력해주세요."); return; }
    if (form.phone && !/^[0-9+()\s-]{8,24}$/.test(form.phone)) {
      setError("휴대폰 번호를 확인해주세요."); return;
    }
    const today = new Date();
    const localToday = `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}-${String(today.getDate()).padStart(2, "0")}`;
    if (form.birthday && (!/^\d{4}-\d{2}-\d{2}$/.test(form.birthday) || form.birthday > localToday)) {
      setError("생년월일을 확인해주세요."); return;
    }
    submitting.current = true;
    setBusy(true);
    setError("");
    setSaved(false);
    try {
      await setDoc(doc(db, "users", loadedUid), {
        memberInfo: { ...form, name, phone: form.phone.trim(), updatedAt: serverTimestamp() },
      }, { merge: true });
      if (auth.currentUser?.uid === loadedUid) setSaved(true);
    } catch {
      setError("저장하지 못했어요. 연결 상태와 저장 권한을 확인해주세요.");
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  const changeEmail = async () => {
    const currentUser = auth.currentUser;
    const email = newEmail.trim();

    if (
      submitting.current ||
      !currentUser ||
      currentUser.uid !== loadedUid
    ) return;

    if (!email || email === currentUser.email) {
      setError("변경할 새 이메일 주소를 입력해주세요.");
      return;
    }

    submitting.current = true;
    setBusy(true);
    setError("");
    setEmailMessage("");

    try {
      await verifyBeforeUpdateEmail(currentUser, email);
      setEmailMessage(
        `${email}로 확인 메일을 보냈어요. 메일의 링크를 눌러 변경을 완료해주세요.`
      );
    } catch (error) {
      const messages = {
        "auth/invalid-email": "이메일 주소 형식을 확인해주세요.",
        "auth/email-already-in-use": "이미 사용 중인 이메일이에요.",
        "auth/requires-recent-login":
          "다시 로그인한 후 이메일 변경을 진행해주세요.",
        "auth/too-many-requests":
          "요청이 많아요. 잠시 후 다시 시도해주세요.",
      };

      setError(
        messages[error.code] || "확인 메일을 보내지 못했어요. 다시 시도해주세요."
      );
    } finally {
      submitting.current = false;
      setBusy(false);
    }
  };

  return (
    <WavveAccountModal title="회원정보 수정" busy={busy} success={saved}
      successMessage="회원정보가 수정되었어요" onClose={onClose}>
      {(close) => (
        <form className="wam-body" onSubmit={save} aria-busy={busy || loading || authLoading}>
          <div className="member-info-modal__intro">
            <p>개인정보 수정</p>
            <p>회원정보와 수신 동의 설정을 확인하고 수정해주세요.</p>
          </div>
          {authLoading || loading ? <p role="status">회원정보를 불러오는 중이에요.</p> : !user ? (
            <p className="member-info-modal__notice">로그인 후 회원정보를 수정할 수 있어요. <Link to="/login" onClick={close}>로그인하기</Link></p>
          ) : (
            <fieldset disabled={busy || loadedUid !== user.uid} className="member-info-modal__fields">
              <label htmlFor={`${id}-name`}>이름</label>
              <input className="wam-input" id={`${id}-name`} name="name" autoComplete="name" maxLength={60} required value={form.name} onChange={updateField} placeholder="이름을 입력해주세요" />
              <label htmlFor={`${id}-provider`}>SNS 연동</label>
              <button
                className="wam-button member-info-modal__sns"
                id={`${id}-provider`}
                type="button"
                aria-haspopup="dialog"
                onClick={() => setSnsOwnerId(user.uid)}
              >
                SNS 연결 관리 <span aria-hidden="true">›</span>
              </button>
              <label htmlFor={`${id}-gender`}>성별</label>
              <select className="wam-input" id={`${id}-gender`} name="gender" value={form.gender} onChange={updateField}>
                <option value="">선택 안 함</option><option value="male">남성</option><option value="female">여성</option><option value="other">기타</option>
              </select>
              <label htmlFor={`${id}-birthday`}>생년월일</label>
              <input className="wam-input" id={`${id}-birthday`} type="date" name="birthday" autoComplete="bday" value={form.birthday} onChange={updateField} />
              <label htmlFor={`${id}-phone`}>휴대폰 번호</label>
              <input className="wam-input" id={`${id}-phone`} type="tel" name="phone" autoComplete="tel" maxLength={24} value={form.phone} onChange={updateField} placeholder="휴대폰 번호를 입력해주세요" />
              <label htmlFor={`${id}-email`}>이메일 주소</label>
              <div className="member-info-modal__email">
                <input className="wam-input"
                  id={`${id}-email`}
                  type="email"
                  autoComplete="email"
                  value={newEmail}
                  onChange={(event) => {
                    setNewEmail(event.target.value);
                    setEmailMessage("");
                  }}
                  placeholder="새 이메일 주소를 입력해주세요"
                  aria-describedby={`${id}-email-help`}
                />

                <button
                  className="wam-button wam-button--primary"
                  type="button"
                  onClick={changeEmail}
                  disabled={
                    busy ||
                    !newEmail.trim() ||
                    newEmail.trim() === user.email
                  }
                >
                  변경
                </button>
              </div>

              <p id={`${id}-email-help`} className="member-info-modal__hint">
                새 이메일로 보낸 확인 링크를 누르면 변경돼요.
              </p>

              {emailMessage && (
                <p className="member-info-modal__hint" role="status">
                  {emailMessage}
                </p>
              )}            <div className="member-info-modal__consents">
                {consentLabels.map(([key, label]) => (
                  <label key={key}>
                    <input type="checkbox" checked={Boolean(form.consents[key])} onChange={event => {
                      const checked = event.target.checked;
                      setForm(previous => ({ ...previous, consents: { ...previous.consents, [key]: checked } }));
                      setSaved(false);
                    }} />
                    <span>{label}</span>
                  </label>
                ))}
              </div>
            </fieldset>
          )}
          {error && <p role="alert" className="member-info-modal__error">{error}</p>}
          <div className="member-info-modal__actions">
            <button className="wam-button" type="button" onClick={close} disabled={busy}>{saved ? "닫기" : "취소"}</button>
            <button className="wam-button wam-button--primary" type="submit" disabled={busy || loading || authLoading || !user || loadedUid !== user.uid}>{busy ? "저장 중…" : "수정하기"}</button>
          </div>
          {snsOwnerId && snsOwnerId === user?.uid && (
            <SnsConnectionModal user={user} onClose={() => setSnsOwnerId(null)} />
          )}
        </form>
      )}
    </WavveAccountModal>
  );
}
