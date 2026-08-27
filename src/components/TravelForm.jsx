import { useState } from "react";
import styles from "./TravelForm.module.scss";
const initial = {
  destination: "",
  budget: "",
  duration: "",
  people: "",
  interest: "",
};
export default function TravelForm({ onSubmit, loading }) {
  const [form, setForm] = useState(initial);
  const change = (e) => setForm({ ...form, [e.target.name]: e.target.value });
  const submit = (e) => {
    e.preventDefault();
    if (e.currentTarget.reportValidity()) onSubmit(form);
  };
  return (
    <form className={styles.form} onSubmit={submit}>
      <label>
        어디로 떠나고 싶나요?
        <input
          name="destination"
          value={form.destination}
          onChange={change}
          required
          placeholder="예: 교토, 제주, 어디든"
        />
      </label>
      <div>
        <label>
          여행 기간
          <select
            name="duration"
            value={form.duration}
            onChange={change}
            required
          >
            <option value="">선택</option>
            <option>2박 3일</option>
            <option>3박 4일</option>
            <option>4박 5일</option>
            <option>일주일 이상</option>
          </select>
        </label>
        <label>
          인원
          <input
            name="people"
            type="number"
            min="1"
            max="10"
            value={form.people}
            onChange={change}
            required
            placeholder="2"
          />
        </label>
      </div>
      <div>
        <label>
          1인 예산
          <input
            name="budget"
            type="number"
            min="100000"
            step="10000"
            value={form.budget}
            onChange={change}
            required
            placeholder="800000"
          />
        </label>
        <label>
          관심사
          <input
            name="interest"
            value={form.interest}
            onChange={change}
            required
            placeholder="미식, 건축, 휴식"
          />
        </label>
      </div>
      <button disabled={loading}>
        {loading ? "REMIXING…" : "MY TRIP REMIX →"}
      </button>
    </form>
  );
}
