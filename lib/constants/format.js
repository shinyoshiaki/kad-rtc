"use strict";

Object.defineProperty(exports, "__esModule", {
  value: true
});
exports.packetFormat = packetFormat;
exports.sendFormat = sendFormat;
exports.appBoardFormat = appBoardFormat;
exports.boardThreadTitleFormat = boardThreadTitleFormat;

var _type = require("./type");

var _type2 = _interopRequireDefault(_type);

var _sha = require("sha1");

var _sha2 = _interopRequireDefault(_sha);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

/*
p2ch communication model(layer)
-------------------------------
(datalinkLayer)    <- onCommand(datalinkLayer)
network
transport
(session)    <- transaction / newblock
presen
app
*/

function packetFormat(type, data) {
  var packet = {
    layer: "networkLayer",
    type: type,
    data: data,
    date: Date.now(),
    hash: ""
  };
  packet.hash = (0, _sha2.default)(JSON.stringify(packet));
  return JSON.stringify(packet);
}

//transportLayer
function sendFormat(session, body) {
  return JSON.stringify({
    layer: "transport",
    transport: "p2ch",
    type: _type2.default.BLOCKCHAIN,
    session: session,
    body: body //transaction format / board format
  });
}

//presenLayer
function appBoardFormat(order, data) {
  return {
    layer: "presen",
    presen: order,
    data: data
  };
}

//appLayer
function boardThreadTitleFormat(title, tag) {
  return {
    layer: "app",
    app: _type2.default.THREAD_TITLE,
    title: title,
    tag: tag,
    date: Date.now()
  };
}
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJzb3VyY2VzIjpbIi4uLy4uL3NyYy9jb25zdGFudHMvZm9ybWF0LmpzIl0sIm5hbWVzIjpbInBhY2tldEZvcm1hdCIsInNlbmRGb3JtYXQiLCJhcHBCb2FyZEZvcm1hdCIsImJvYXJkVGhyZWFkVGl0bGVGb3JtYXQiLCJ0eXBlIiwiZGF0YSIsInBhY2tldCIsImxheWVyIiwiZGF0ZSIsIkRhdGUiLCJub3ciLCJoYXNoIiwiSlNPTiIsInN0cmluZ2lmeSIsInNlc3Npb24iLCJib2R5IiwidHJhbnNwb3J0IiwiQkxPQ0tDSEFJTiIsIm9yZGVyIiwicHJlc2VuIiwidGl0bGUiLCJ0YWciLCJhcHAiLCJUSFJFQURfVElUTEUiXSwibWFwcGluZ3MiOiI7Ozs7O1FBYWdCQSxZLEdBQUFBLFk7UUFhQUMsVSxHQUFBQSxVO1FBV0FDLGMsR0FBQUEsYztRQVNBQyxzQixHQUFBQSxzQjs7QUE5Q2hCOzs7O0FBQ0E7Ozs7OztBQUNBOzs7Ozs7Ozs7OztBQVdPLFNBQVNILFlBQVQsQ0FBc0JJLElBQXRCLEVBQTRCQyxJQUE1QixFQUFrQztBQUN2QyxNQUFJQyxTQUFTO0FBQ1hDLFdBQU8sY0FESTtBQUVYSCxVQUFNQSxJQUZLO0FBR1hDLFVBQU1BLElBSEs7QUFJWEcsVUFBTUMsS0FBS0MsR0FBTCxFQUpLO0FBS1hDLFVBQU07QUFMSyxHQUFiO0FBT0FMLFNBQU9LLElBQVAsR0FBYyxtQkFBS0MsS0FBS0MsU0FBTCxDQUFlUCxNQUFmLENBQUwsQ0FBZDtBQUNBLFNBQU9NLEtBQUtDLFNBQUwsQ0FBZVAsTUFBZixDQUFQO0FBQ0Q7O0FBRUQ7QUFDTyxTQUFTTCxVQUFULENBQW9CYSxPQUFwQixFQUE2QkMsSUFBN0IsRUFBbUM7QUFDeEMsU0FBT0gsS0FBS0MsU0FBTCxDQUFlO0FBQ3BCTixXQUFPLFdBRGE7QUFFcEJTLGVBQVcsTUFGUztBQUdwQlosVUFBTUEsZUFBS2EsVUFIUztBQUlwQkgsYUFBU0EsT0FKVztBQUtwQkMsVUFBTUEsSUFMYyxDQUtUO0FBTFMsR0FBZixDQUFQO0FBT0Q7O0FBRUQ7QUFDTyxTQUFTYixjQUFULENBQXdCZ0IsS0FBeEIsRUFBK0JiLElBQS9CLEVBQXFDO0FBQzFDLFNBQU87QUFDTEUsV0FBTyxRQURGO0FBRUxZLFlBQVFELEtBRkg7QUFHTGIsVUFBTUE7QUFIRCxHQUFQO0FBS0Q7O0FBRUQ7QUFDTyxTQUFTRixzQkFBVCxDQUFnQ2lCLEtBQWhDLEVBQXVDQyxHQUF2QyxFQUE0QztBQUNqRCxTQUFPO0FBQ0xkLFdBQU8sS0FERjtBQUVMZSxTQUFLbEIsZUFBS21CLFlBRkw7QUFHTEgsV0FBT0EsS0FIRjtBQUlMQyxTQUFLQSxHQUpBO0FBS0xiLFVBQU1DLEtBQUtDLEdBQUw7QUFMRCxHQUFQO0FBT0QiLCJmaWxlIjoiZm9ybWF0LmpzIiwic291cmNlc0NvbnRlbnQiOlsiaW1wb3J0IHR5cGUgZnJvbSBcIi4vdHlwZVwiO1xuaW1wb3J0IHNoYTEgZnJvbSBcInNoYTFcIjtcbi8qXG5wMmNoIGNvbW11bmljYXRpb24gbW9kZWwobGF5ZXIpXG4tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tLS0tXG4oZGF0YWxpbmtMYXllcikgICAgPC0gb25Db21tYW5kKGRhdGFsaW5rTGF5ZXIpXG5uZXR3b3JrXG50cmFuc3BvcnRcbihzZXNzaW9uKSAgICA8LSB0cmFuc2FjdGlvbiAvIG5ld2Jsb2NrXG5wcmVzZW5cbmFwcFxuKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHBhY2tldEZvcm1hdCh0eXBlLCBkYXRhKSB7XG4gIGxldCBwYWNrZXQgPSB7XG4gICAgbGF5ZXI6IFwibmV0d29ya0xheWVyXCIsXG4gICAgdHlwZTogdHlwZSxcbiAgICBkYXRhOiBkYXRhLFxuICAgIGRhdGU6IERhdGUubm93KCksXG4gICAgaGFzaDogXCJcIlxuICB9O1xuICBwYWNrZXQuaGFzaCA9IHNoYTEoSlNPTi5zdHJpbmdpZnkocGFja2V0KSk7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeShwYWNrZXQpO1xufVxuXG4vL3RyYW5zcG9ydExheWVyXG5leHBvcnQgZnVuY3Rpb24gc2VuZEZvcm1hdChzZXNzaW9uLCBib2R5KSB7XG4gIHJldHVybiBKU09OLnN0cmluZ2lmeSh7XG4gICAgbGF5ZXI6IFwidHJhbnNwb3J0XCIsXG4gICAgdHJhbnNwb3J0OiBcInAyY2hcIixcbiAgICB0eXBlOiB0eXBlLkJMT0NLQ0hBSU4sXG4gICAgc2Vzc2lvbjogc2Vzc2lvbixcbiAgICBib2R5OiBib2R5IC8vdHJhbnNhY3Rpb24gZm9ybWF0IC8gYm9hcmQgZm9ybWF0XG4gIH0pO1xufVxuXG4vL3ByZXNlbkxheWVyXG5leHBvcnQgZnVuY3Rpb24gYXBwQm9hcmRGb3JtYXQob3JkZXIsIGRhdGEpIHtcbiAgcmV0dXJuIHtcbiAgICBsYXllcjogXCJwcmVzZW5cIixcbiAgICBwcmVzZW46IG9yZGVyLFxuICAgIGRhdGE6IGRhdGFcbiAgfTtcbn1cblxuLy9hcHBMYXllclxuZXhwb3J0IGZ1bmN0aW9uIGJvYXJkVGhyZWFkVGl0bGVGb3JtYXQodGl0bGUsIHRhZykge1xuICByZXR1cm4ge1xuICAgIGxheWVyOiBcImFwcFwiLFxuICAgIGFwcDogdHlwZS5USFJFQURfVElUTEUsXG4gICAgdGl0bGU6IHRpdGxlLFxuICAgIHRhZzogdGFnLFxuICAgIGRhdGU6IERhdGUubm93KClcbiAgfTtcbn1cbiJdfQ==