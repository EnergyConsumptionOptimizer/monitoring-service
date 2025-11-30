export const mapToLocalTime = `  |> map(fn: (r) => {
  m = date.month(t: r._time)
  offset = if m >= 4 and m <= 9 then 2h else 1h
  return { r with _time: date.add(d:offset, to:r._time) }
})`;
