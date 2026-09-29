import React, { useState } from 'react';
import { useAppStore } from '../lib/store';
import type { AccuracyClass, InstrumentStatus } from '../types';
import { X, Check, AlertCircle } from 'lucide-react';

interface Props { onClose: () => void; }

interface FormData {
  manufacturer: string;
  model: string;
  serial_number: string;
  instrument_type: string;
  accuracy_class: AccuracyClass;
  max_capacity: string;
  verification_interval: string;
  min_capacity: string;
  unit: string;
  location: string;
  manufacturer_details: string;
  owner_organization: string;
  date_received: string;
  notes: string;
}

const initialForm: FormData = {
  manufacturer: '', model: '', serial_number: '', instrument_type: 'Electronic Platform Scale',
  accuracy_class: 'III', max_capacity: '', verification_interval: '', min_capacity: '',
  unit: 'g', location: '', manufacturer_details: '', owner_organization: 'National Metrology Laboratory',
  date_received: new Date().toISOString().split('T')[0], notes: '',
};

export default function InstrumentRegistrationModal({ onClose }: Props) {
  const { addInstrument, currentUser } = useAppStore();
  const [form, setForm] = useState<FormData>(initialForm);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);

  const set = (field: keyof FormData, value: string) => {
    setForm(f => ({ ...f, [field]: value }));
    setErrors(e => ({ ...e, [field]: '' }));
  };

  const autoCalculateMin = () => {
    const eVal = parseFloat(form.verification_interval);
    if (isNaN(eVal) || eVal <= 0) return;
    let multiplier = 20;
    if (form.accuracy_class === 'I') multiplier = 100;
    else if (form.accuracy_class === 'II') multiplier = 20;
    else if (form.accuracy_class === 'III') multiplier = 20;
    else if (form.accuracy_class === 'IIII') multiplier = 10;
    set('min_capacity', String(eVal * multiplier));
  };

  const validate = (): boolean => {
    const errs: Record<string, string> = {};
    if (!form.manufacturer.trim()) errs.manufacturer = 'Manufacturer is required.';
    if (!form.model.trim()) errs.model = 'Model is required.';
    if (!form.serial_number.trim()) errs.serial_number = 'Serial number is required.';
    if (!form.instrument_type.trim()) errs.instrument_type = 'Instrument type is required.';
    const max = parseFloat(form.max_capacity);
    if (!form.max_capacity || isNaN(max) || max <= 0) errs.max_capacity = 'Valid maximum capacity is required.';
    const e = parseFloat(form.verification_interval);
    if (!form.verification_interval || isNaN(e) || e <= 0) errs.verification_interval = 'Valid verification interval is required.';
    const min = parseFloat(form.min_capacity);
    if (!form.min_capacity || isNaN(min) || min < 0) errs.min_capacity = 'Valid minimum capacity is required.';
    if (max && min && min >= max) errs.min_capacity = 'Min capacity must be less than Max.';
    if (max && e && max / e < 100) errs.verification_interval = 'n (Max/e) must be at least 100.';
    if (!form.location.trim()) errs.location = 'Location is required.';
    if (!form.owner_organization.trim()) errs.owner_organization = 'Owner organization is required.';
    setErrors(errs);
    return Object.keys(errs).length === 0;
  };

  const handleSubmit = async (asDraft: boolean) => {
    if (!asDraft && !validate()) return;
    setSaving(true);
    await new Promise(r => setTimeout(r, 400));
    addInstrument({
      manufacturer: form.manufacturer,
      model: form.model,
      serial_number: form.serial_number,
      instrument_type: form.instrument_type,
      accuracy_class: form.accuracy_class,
      max_capacity: parseFloat(form.max_capacity) || 0,
      verification_interval: parseFloat(form.verification_interval) || 1,
      min_capacity: parseFloat(form.min_capacity) || 0,
      unit: form.unit,
      location: form.location,
      manufacturer_details: form.manufacturer_details,
      owner_organization: form.owner_organization,
      date_received: form.date_received,
      status: asDraft ? 'draft' : 'registered',
      created_by: currentUser?.id || 'system',
      notes: form.notes,
    });
    setSaving(false);
    onClose();
  };

  const n = form.max_capacity && form.verification_interval
    ? Math.floor(parseFloat(form.max_capacity) / parseFloat(form.verification_interval))
    : 0;

  return (
    <div className="modal-overlay" onClick={e => e.target === e.currentTarget && onClose()}>
      <div className="modal" style={{ maxWidth: 640 }}>
        <div className="modal-header">
          <div className="modal-title">Register New Instrument</div>
          <button className="btn-ghost" onClick={onClose}><X size={16} /></button>
        </div>
        <div className="modal-body">
          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Manufacturer <span className="required">*</span></label>
              <input className={`form-input ${errors.manufacturer ? 'error' : ''}`} value={form.manufacturer} onChange={e => set('manufacturer', e.target.value)} placeholder="e.g. Mettler Toledo" />
              {errors.manufacturer && <div className="form-error">{errors.manufacturer}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Model <span className="required">*</span></label>
              <input className={`form-input ${errors.model ? 'error' : ''}`} value={form.model} onChange={e => set('model', e.target.value)} placeholder="e.g. XPR10002S" />
              {errors.model && <div className="form-error">{errors.model}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Serial Number <span className="required">*</span></label>
              <input className={`form-input ${errors.serial_number ? 'error' : ''}`} value={form.serial_number} onChange={e => set('serial_number', e.target.value)} placeholder="e.g. MT-20260115-A" />
              {errors.serial_number && <div className="form-error">{errors.serial_number}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Instrument Type <span className="required">*</span></label>
              <select className="form-select" value={form.instrument_type} onChange={e => set('instrument_type', e.target.value)}>
                <option>Electronic Platform Scale</option>
                <option>Precision Balance</option>
                <option>Counter Scale</option>
                <option>Bench Scale</option>
                <option>Industrial Platform Scale</option>
                <option>Crane Scale</option>
                <option>Hopper Scale</option>
                <option>Vehicle Weighbridge</option>
              </select>
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <label className="form-label">Accuracy Class <span className="required">*</span></label>
              <select className="form-select" value={form.accuracy_class} onChange={e => set('accuracy_class', e.target.value)}>
                <option value="I">Class I (Special)</option>
                <option value="II">Class II (High)</option>
                <option value="III">Class III (Medium)</option>
                <option value="IIII">Class IIII (Ordinary)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">Max Capacity (Max) <span className="required">*</span></label>
              <input className={`form-input ${errors.max_capacity ? 'error' : ''}`} type="number" step="any" value={form.max_capacity} onChange={e => set('max_capacity', e.target.value)} placeholder="e.g. 10000" />
              {errors.max_capacity && <div className="form-error">{errors.max_capacity}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Verification Interval (e) <span className="required">*</span></label>
              <input className={`form-input ${errors.verification_interval ? 'error' : ''}`} type="number" step="any" value={form.verification_interval} onChange={e => set('verification_interval', e.target.value)} placeholder="e.g. 5" />
              {errors.verification_interval && <div className="form-error">{errors.verification_interval}</div>}
            </div>
          </div>

          <div className="form-row-3">
            <div className="form-group">
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '0.35rem' }}>
                <label className="form-label" style={{ margin: 0 }}>Min Capacity (Min) <span className="required">*</span></label>
                <button 
                  type="button" 
                  onClick={autoCalculateMin}
                  className="btn-ghost" 
                  style={{ padding: '0 4px', fontSize: '0.68rem', color: 'var(--amber)', height: 'auto', textDecoration: 'underline', border: 'none', background: 'transparent', cursor: 'pointer' }}
                  title="Auto calculate Min based on Accuracy Class OIML R-76 Table 3 rules"
                >
                  ⚡ Auto
                </button>
              </div>
              <input className={`form-input ${errors.min_capacity ? 'error' : ''}`} type="number" step="any" value={form.min_capacity} onChange={e => set('min_capacity', e.target.value)} placeholder="e.g. 100" />
              {errors.min_capacity && <div className="form-error">{errors.min_capacity}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Unit</label>
              <select className="form-select" value={form.unit} onChange={e => set('unit', e.target.value)}>
                <option value="g">g (grams)</option>
                <option value="kg">kg (kilograms)</option>
                <option value="mg">mg (milligrams)</option>
                <option value="t">t (tonnes)</option>
                <option value="lb">lb (pounds)</option>
              </select>
            </div>
            <div className="form-group">
              <label className="form-label">n (Max ÷ e)</label>
              <div className="form-input" style={{ background: 'var(--navy-mid)', color: n > 0 ? 'var(--amber)' : 'var(--steel)', fontFamily: 'var(--font-mono)' }}>
                {n > 0 ? n.toLocaleString() : '—'}
              </div>
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Location <span className="required">*</span></label>
              <input className={`form-input ${errors.location ? 'error' : ''}`} value={form.location} onChange={e => set('location', e.target.value)} placeholder="e.g. Lab A — Room 101" />
              {errors.location && <div className="form-error">{errors.location}</div>}
            </div>
            <div className="form-group">
              <label className="form-label">Owner Organization <span className="required">*</span></label>
              <input className={`form-input ${errors.owner_organization ? 'error' : ''}`} value={form.owner_organization} onChange={e => set('owner_organization', e.target.value)} />
              {errors.owner_organization && <div className="form-error">{errors.owner_organization}</div>}
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label className="form-label">Manufacturer Details</label>
              <input className="form-input" value={form.manufacturer_details} onChange={e => set('manufacturer_details', e.target.value)} placeholder="Address, country, etc." />
            </div>
            <div className="form-group">
              <label className="form-label">Date Received</label>
              <input className="form-input" type="date" value={form.date_received} onChange={e => set('date_received', e.target.value)} />
            </div>
          </div>

          <div className="form-group">
            <label className="form-label">Notes</label>
            <textarea className="form-textarea" value={form.notes} onChange={e => set('notes', e.target.value)} placeholder="Additional observations or remarks…" rows={2} />
          </div>
        </div>
        <div className="modal-footer">
          <button className="btn btn-secondary" onClick={onClose}>Cancel</button>
          <button className="btn btn-secondary" onClick={() => handleSubmit(true)} disabled={saving}>Save Draft</button>
          <button className="btn btn-primary" onClick={() => handleSubmit(false)} disabled={saving}>
            {saving ? 'Registering…' : 'Register Instrument'}
          </button>
        </div>
      </div>
    </div>
  );
}
