import escape from 'escape-html';

export default function handler(req, res) {
  return res.send(escape(req.query.word));
}
