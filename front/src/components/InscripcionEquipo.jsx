
// front/src/components/InscripcionEquipo.jsx
import { useEffect, useState } from 'react';
import "../inscripcion.css";



export default function InscripcionEquipo({ open, onClose }) {
  const [torneos, setTorneos] = useState([]);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    torneoId: '',
    nombreEquipo: '',
    nombreCapitan: '',
    emailCapitan: '',
  });
  const [msg, setMsg] = useState(null);

  useEffect(() => {
    if (!open) return;
    (async () => {
      try {
        const ts = await listarTorneos().catch(() => []);
        setTorneos(ts);
      } catch (e) {
        setTorneos([]);
      }
    })();
  }, [open]);

  function onChange(e) {
    const { name, value } = e.target;
    setForm((f) => ({ ...f, [name]: value }));
  }

  async function onSubmit(e) {
    e.preventDefault();
    setLoading(true);
    setMsg(null);
    try {
      const payload = {
        torneoId: form.torneoId,
        nombreEquipo: form.nombreEquipo,
        nombreCapitan: form.nombreCapitan,
        emailCapitan: form.emailCapitan,
      };
      const r = await crearInscripcion(payload);
      setMsg('¡Inscripción registrada!');
      // limpiar
      setForm({
        torneoId: '',
        nombreEquipo: '',
        nombreCapitan: '',
        emailCapitan: '',
      });
    } catch (err) {
      setMsg('Ocurrió un error al inscribirse');
    } finally {
      setLoading(false);
    }
  }

  if (!open) return null;

  return (
    <div className="modal-backdrop" onClick={onClose}>
      <div className="modal-card" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h3>Inscripción a Torneo</h3>
          <button className="btn-close" onClick={onClose}>×</button>
        </div>

        <form onSubmit={onSubmit} className="modal-body">
          <label>
            Torneo
            <select
              name="torneoId"
              value={form.torneoId}
              onChange={onChange}
              required
            >
              <option value="">Seleccioná…</option>
              {torneos.map(t => (
                <option key={t.id_torneo} value={t.id_torneo}>
                  {t.nombre_torneo}
                </option>
              ))}
            </select>
          </label>

          <label>
            Nombre del equipo
            <input
              type="text"
              name="nombreEquipo"
              value={form.nombreEquipo}
              onChange={onChange}
              required
            />
          </label>

          <label>
            Capitán (nombre)
            <input
              type="text"
              name="nombreCapitan"
              value={form.nombreCapitan}
              onChange={onChange}
              required
            />
          </label>

          <label>
            Correo del capitán
            <input
              type="email"
              name="emailCapitan"
              value={form.emailCapitan}
              onChange={onChange}
              required
            />
          </label>

          {msg && <p className="form-msg">{msg}</p>}

          <div className="modal-actions">
            <button type="button" className="btn-secondary" onClick={onClose}>
              Cancelar
            </button>
            <button type="submit" className="btn-primary" disabled={loading}>
              {loading ? 'Enviando…' : 'Inscribirme'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
