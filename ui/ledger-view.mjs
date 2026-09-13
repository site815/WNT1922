export const esc = value => String(value ?? '').replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]));
export const num = (value, decimals=0) => Number(value || 0).toLocaleString('en-US',{maximumFractionDigits:decimals});
export const pct = (value, decimals=2) => num(value*100,decimals)+'%';
export const signed = value => (value<0?'−':'+')+num(Math.abs(value),2);
export const facts = rows => '<dl class="ledger-facts">'+rows.map(([name,value,hint])=>'<div'+(hint?' title="'+esc(hint)+'"':'')+'><dt>'+esc(name)+'</dt><dd>'+esc(value)+'</dd></div>').join('')+'</dl>';
export const panel = (title, body, key='') => '<section class="panel ledger-panel"><h2'+(key?' tabindex="0" data-resource="'+key+'"':'')+'>'+esc(title)+'</h2>'+body+'</section>';
export const table = (headers, rows) => '<div class="table-scroll"><table><thead><tr>'+headers.map(h=>'<th>'+esc(h)+'</th>').join('')+'</tr></thead><tbody>'+rows.map(row=>'<tr>'+row.map(cell=>'<td>'+cell+'</td>').join('')+'</tr>').join('')+'</tbody></table></div>';
