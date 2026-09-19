var hn=Object.freeze({mona:{name:"Mona",subtitle:"Curious by nature",accent:"#6441ac",short:"MON"},copilot:{name:"Copilot",subtitle:"Ready to explore",accent:"#28797e",short:"COP"},ducky:{name:"Ducky",subtitle:"A little sunshine",accent:"#a47a13",short:"DUC"}}),Pn=Object.freeze({chunky:{name:"\u3056\u3063\u304F\u308A",english:"Chunky"},balanced:{name:"\u30D0\u30E9\u30F3\u30B9",english:"Balanced"},fine:{name:"\u3053\u307E\u304B\u304F",english:"Fine"}}),Es="SELECTED_PROTOTYPE",Ui="/design/selected-designs.json",Fi=Object.freeze({GROUND:"\u57FA\u5E95\u9762\u306B\u914D\u7F6E\u30FB\u5B9F\u6A5F\u672A\u78BA\u8A8D",SEATED_NOMINAL:"\u516C\u79F0\u7740\u5EA7\u30FB\u4FDD\u6301\u529B\u672A\u78BA\u8A8D",RETENTION_REQUIRED:"\u4FDD\u6301\u5BFE\u7B56\u304C\u5FC5\u8981",CRADLE_AND_RETENTION_REQUIRED:"\u53D7\u3051\u53F0\u3068\u4FDD\u6301\u5BFE\u7B56\u304C\u5FC5\u8981",CRADLE_SUPPORTED_RETENTION_REQUIRED:"\u4EEE\u652F\u6301\u53F0\u304C\u5FC5\u8981\u30FB\u4FDD\u6301\u529B\u672A\u78BA\u8A8D"}),uc=Object.freeze({SELF_WEIGHT_CANTILEVER_REQUIRES_RETENTION_OR_TEMPORARY_SUPPORT:"\u5358\u4F53\u81EA\u91CD\u306E\u7247\u6301\u3061\u6761\u4EF6\u30FB\u4FDD\u6301\u5BFE\u7B56\u307E\u305F\u306F\u4EEE\u652F\u6301\u304C\u5FC5\u8981",SINGLE_ROUND_STUD_ROTATIONAL_RETENTION_UNKNOWN:"\u4E38\u30B9\u30BF\u30C3\u30C91\u672C\u30FB\u56DE\u8EE2\u4FDD\u6301\u306F\u672A\u78BA\u8A8D",HANGING_WHISKER_AFTER_CRADLE_REMOVAL:"\u4EEE\u652F\u6301\u53F0\u3092\u5916\u3057\u305F\u5F8C\u306E\u3072\u3052\u5148\u7AEF\u306E\u4FDD\u6301\u306F\u672A\u78BA\u8A8D"}),Po=i=>Object.hasOwn(uc,i)?uc[i]:i,Yd=new Set(["Phase1 exterior baseline only","Visual baseline only: character, source palette, approximately 180 mm scale and chosen grid feel"]),Se=class extends Error{constructor(t){super(t),this.name="DataError"}},et=(i,t)=>{if(!i)throw new Se(t)},le=i=>i!==null&&typeof i=="object"&&!Array.isArray(i),fr=i=>typeof i=="number"&&Number.isFinite(i),Pe=i=>Number.isSafeInteger(i)&&i>=0,ln=i=>fr(i)&&i>0,pi=(i,t)=>Array.isArray(i)&&i.length===t&&i.every(fr),He=i=>typeof i=="string"&&i.length>0,ws=(i,t)=>Object.hasOwn(i,t),Zd=new Intl.Collator("en",{numeric:!0});function Ie(i){et(He(i),"\u30D5\u30A1\u30A4\u30EB\u306E\u53C2\u7167\u5148\u304C\u3042\u308A\u307E\u305B\u3093\u3002");let t=i.startsWith("artifacts/")?`/${i}`:i;et(t.startsWith("/artifacts/")&&!t.includes("\\"),"\u30ED\u30FC\u30AB\u30EB\u306E artifacts \u4EE5\u5916\u306F\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3002");let e=new URL(t,"http://local.invalid");return et(e.origin==="http://local.invalid"&&e.pathname.startsWith("/artifacts/"),"\u30D5\u30A1\u30A4\u30EB\u306E\u53C2\u7167\u5148\u304C\u4E0D\u6B63\u3067\u3059\u3002"),et(!e.username&&!e.password,"\u8A8D\u8A3C\u60C5\u5831\u3092\u542B\u3080\u53C2\u7167\u5148\u306F\u4F7F\u3048\u307E\u305B\u3093\u3002"),`${e.pathname}${e.search}${e.hash}`}function cn(i,t){et(typeof t=="string"&&/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(t),"\u8A66\u4F5C\u7248\u306E\u8B58\u5225\u5B50\u304C\u4E0D\u6B63\u3067\u3059\u3002");let e=Ie(i);return et(new URL(e,"http://local.invalid").pathname.startsWith(`/artifacts/selected/${t}/`),"\u9078\u629E\u7248\u306E\u30C7\u30FC\u30BF\u306B\u5225\u306E\u7248\u306E\u30D5\u30A1\u30A4\u30EB\u304C\u6DF7\u5728\u3057\u3066\u3044\u307E\u3059\u3002"),e}function pc(i,t,e=!1){if(!e&&i.footprint_cells===void 0)return;et(Array.isArray(i.footprint_cells)&&i.footprint_cells.length>0,`${t} \u306E\u5360\u6709\u30BB\u30EB\u5B9A\u7FA9\u304C\u3042\u308A\u307E\u305B\u3093\u3002`);let n=new Set;for(let a of i.footprint_cells){et(Array.isArray(a)&&a.length===2&&a.every(Pe)&&a[0]<i.cells[0]&&a[1]<i.cells[1],`${t} \u306E\u5360\u6709\u30BB\u30EB\u304C\u5916\u63A5\u7BC4\u56F2\u5916\u3067\u3059\u3002`);let o=a.join(",");et(!n.has(o),`${t} \u306E\u5360\u6709\u30BB\u30EB\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002`),n.add(o)}let s=[i.footprint_cells[0]],r=new Set([s[0].join(",")]);for(let a=0;a<s.length;a+=1){let[o,l]=s[a];for(let c of[[o-1,l],[o+1,l],[o,l-1],[o,l+1]]){let u=c.join(",");n.has(u)&&!r.has(u)&&(r.add(u),s.push(c))}}et(r.size===n.size,`${t} \u306E\u5360\u6709\u30BB\u30EB\u304C\u9023\u7D50\u3057\u3066\u3044\u307E\u305B\u3093\u3002`)}function fc(i,t="\u30E2\u30C7\u30EB"){et(le(i),`${t}\u306E\u6307\u6A19\u304C\u3042\u308A\u307E\u305B\u3093\u3002`);for(let e of["part_count","unique_types","color_count","layer_count"])et(Pe(i[e])&&i[e]>0,`${t}\u306E ${e} \u304C\u4E0D\u6B63\u3067\u3059\u3002`);for(let e of["height_mm","width_mm","depth_mm"])et(ln(i[e]),`${t}\u306E ${e} \u304C\u4E0D\u6B63\u3067\u3059\u3002`);return et(pi(i.approx_build_hours,2)&&i.approx_build_hours[0]>=0&&i.approx_build_hours[1]>=i.approx_build_hours[0],`${t}\u306E\u7D44\u7ACB\u76EE\u5B89\u304C\u4E0D\u6B63\u3067\u3059\u3002`),i}function mc(i){et(i===void 0||Array.isArray(i)&&i.every(He),"\u6CE8\u610F\u4E8B\u9805\u306E\u5F62\u5F0F\u304C\u4E0D\u6B63\u3067\u3059\u3002")}function gc(i,t="PENDING"){et(le(i),"\u691C\u8A3C\u7BC4\u56F2\u306E\u5BA3\u8A00\u304C\u3042\u308A\u307E\u305B\u3093\u3002"),et(i.visual_selection===t&&i.physical_fit==="UNKNOWN"&&i.production_export==="BLOCKED","PHASE 1\u5916\u89B3\u57FA\u6E96\u306E\u9078\u629E\u7BC4\u56F2\u30FB\u5D4C\u5408\u672A\u78BA\u8A8D\u30FB\u51FA\u529B\u30D6\u30ED\u30C3\u30AF\u306E\u5BA3\u8A00\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002")}function Io(i){et(le(i)&&i.schema_version===1,"\u30AB\u30BF\u30ED\u30B0\u306E\u5F62\u5F0F\u306B\u5BFE\u5FDC\u3057\u3066\u3044\u307E\u305B\u3093\uFF08schema_version: 1 \u304C\u5FC5\u8981\u3067\u3059\uFF09\u3002");let t=i.stage===Es,e=t?r=>cn(r,i.revision):Ie;e(i.prototypes_url),t&&(et(i.selection_url===Ui,"\u9078\u629E\u8A18\u9332\u306E\u53C2\u7167\u5148\u304C\u4E0D\u6B63\u3067\u3059\u3002"),et(Array.isArray(i.candidates)&&i.candidates.length===3,"\u9078\u629E\u7248\u306B\u306F3\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306E\u6848\u304C\u5FC5\u8981\u3067\u3059\u3002")),i.contact_sheet_url&&e(i.contact_sheet_url),et(Array.isArray(i.candidates)&&i.candidates.length>0,"\u6BD4\u8F03\u3067\u304D\u308B\u6848\u304C\u30AB\u30BF\u30ED\u30B0\u306B\u3042\u308A\u307E\u305B\u3093\u3002");let n=new Set,s=new Set;for(let r of i.candidates){et(le(r)&&He(r.id),"\u6848\u306EID\u304C\u3042\u308A\u307E\u305B\u3093\u3002"),et(!n.has(r.id),`\u6848\u306EID\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059: ${r.id}`),et(ws(hn,r.character)&&ws(Pn,r.style),"\u672A\u5BFE\u5FDC\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u307E\u305F\u306F\u89E3\u50CF\u5EA6\u3067\u3059\u3002");let a=`${r.character}/${r.style}`;et(!s.has(a),`\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u3068\u89E3\u50CF\u5EA6\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059: ${a}`),et(He(r.label)&&ln(r.pitch_mm)&&ln(r.layer_mm),`${r.id} \u306E\u8868\u793A\u60C5\u5831\u304C\u4E0D\u6B63\u3067\u3059\u3002`),e(r.manifest_url);for(let o of["render_url","blend_url","video_url","bom_url","evidence_url","summary_bom_url","assembly_steps_url","native_assembly_url"])r[o]&&e(r[o]);fc(r.metrics,r.id),gc(r.status,t?"BASELINE_APPROVED":"PENDING"),t&&et(Pe(r.metrics.baseline_part_count)&&r.metrics.baseline_part_count>0,`${r.id} \u306E\u5916\u89B3\u57FA\u6E96\u90E8\u54C1\u6570\u304C\u3042\u308A\u307E\u305B\u3093\u3002`),mc(r.warnings),n.add(r.id),s.add(a)}return i.evidence_url&&e(i.evidence_url),i.source_history_url&&et(Ie(i.source_history_url).startsWith("/artifacts/phase1/"),"\u5C65\u6B74\u30EA\u30F3\u30AF\u306FPhase1\u306E\u8A18\u9332\u3092\u53C2\u7167\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002"),t&&i.trial_sets!==void 0&&Jd(i.trial_sets,i),i}function _c(i,t){et(le(i)&&[1,2].includes(i.schema_version)&&i.units==="mm","\u914D\u7F6E\u30C7\u30FC\u30BF\u306E\u5F62\u5F0F\u307E\u305F\u306F\u5358\u4F4D\u304C\u672A\u5BFE\u5FDC\u3067\u3059\u3002mm / schema_version: 1 \u307E\u305F\u306F 2 \u304C\u5FC5\u8981\u3067\u3059\u3002");let e=i.schema_version===2;et(i.candidate_id===t,"\u9078\u629E\u3057\u305F\u6848\u3068\u914D\u7F6E\u30C7\u30FC\u30BF\u306EID\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002"),et(le(i.frame)&&i.frame.up==="+Z"&&i.frame.front==="-Y"&&i.frame.handedness==="right","\u914D\u7F6E\u306E\u5EA7\u6A19\u7CFB\u304C\u5951\u7D04\u3068\u7570\u306A\u308A\u307E\u3059\uFF08+Z\u4E0A\u30FB\u2212Y\u524D\u30FB\u53F3\u624B\u7CFB\uFF09\u3002"),et(le(i.palette)&&le(i.types),"\u8272\u307E\u305F\u306F\u90E8\u54C1\u578B\u306E\u5B9A\u7FA9\u304C\u3042\u308A\u307E\u305B\u3093\u3002");for(let[h,f]of Object.entries(i.palette))et(le(f)&&/^#[0-9a-fA-F]{6}$/.test(f.hex)&&He(f.name),`\u8272 ${h} \u306E\u5B9A\u7FA9\u304C\u4E0D\u6B63\u3067\u3059\u3002`);for(let[h,f]of Object.entries(i.types))et(le(f)&&pi(f.cells,2)&&f.cells.every(_=>Pe(_)&&_>0)&&ln(f.pitch_mm)&&ln(f.layer_mm),`\u90E8\u54C1\u578B ${h} \u306E\u5B9A\u7FA9\u304C\u4E0D\u6B63\u3067\u3059\u3002`),pc(f,h,e);et(Array.isArray(i.parts)&&i.parts.length>0,"\u914D\u7F6E\u30C7\u30FC\u30BF\u306B\u90E8\u54C1\u304C\u3042\u308A\u307E\u305B\u3093\u3002");let n=new Set,s=new Set,r=new Set,a=new Set;for(let h of i.parts)et(le(h)&&He(h.id)&&!n.has(h.id),"\u90E8\u54C1ID\u304C\u6B20\u3051\u3066\u3044\u308B\u304B\u3001\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002"),et(ws(i.types,h.type_id)&&ws(i.palette,h.color_id),`${h.id} \u306E\u578B\u307E\u305F\u306F\u8272\u304C\u898B\u3064\u304B\u308A\u307E\u305B\u3093\u3002`),et(pi(h.position_mm,3)&&(e?[0,90,180,270]:[0,90]).includes(h.rotation_z_deg)&&Pe(h.layer)&&Pe(h.step)&&h.step>0,`${h.id} \u306E\u4F4D\u7F6E\u30FB\u56DE\u8EE2\u30FB\u5C64\u30FB\u624B\u9806\u304C\u4E0D\u6B63\u3067\u3059\u3002`),et(h.print_rotation_deg===void 0||pi(h.print_rotation_deg,3),`${h.id} \u306E\u51FA\u529B\u59FF\u52E2\u304C\u4E0D\u6B63\u3067\u3059\u3002`),e&&(et(Array.isArray(h.baseline_part_ids)&&h.baseline_part_ids.length>0&&h.baseline_part_ids.every(He)&&new Set(h.baseline_part_ids).size===h.baseline_part_ids.length,`${h.id} \u306E\u57FA\u6E96\u90E8\u54C1ID\u304C\u4E0D\u6B63\u3067\u3059\u3002`),et(typeof h.changed_grouping=="boolean"&&ws(Fi,h.support_class),`${h.id} \u306E\u7D44\u307F\u66FF\u3048\u30FB\u652F\u6301\u533A\u5206\u304C\u4E0D\u6B63\u3067\u3059\u3002`),et(h.feature_tags===void 0||Array.isArray(h.feature_tags)&&h.feature_tags.every(He),`${h.id} \u306E\u7279\u5FB4\u30BF\u30B0\u304C\u4E0D\u6B63\u3067\u3059\u3002`),et(h.required_aids===void 0||Array.isArray(h.required_aids)&&h.required_aids.every(He)&&new Set(h.required_aids).size===h.required_aids.length,`${h.id} \u306E\u88DC\u52A9\u5177\u53C2\u7167\u304C\u4E0D\u6B63\u3067\u3059\u3002`),et(h.retention_risks===void 0||Array.isArray(h.retention_risks)&&h.retention_risks.every(He)&&new Set(h.retention_risks).size===h.retention_risks.length,`${h.id} \u306E\u4FDD\u6301\u30EA\u30B9\u30AF\u8A18\u9332\u304C\u4E0D\u6B63\u3067\u3059\u3002`),et(h.self_weight_bearing_margin_mm===void 0||h.self_weight_bearing_margin_mm===null||fr(h.self_weight_bearing_margin_mm),`${h.id} \u306E\u81EA\u91CD\u6295\u5F71\u4F59\u88D5\u304C\u4E0D\u6B63\u3067\u3059\u3002`)),n.add(h.id),s.add(h.type_id),r.add(h.color_id),a.add(h.layer);fc(i.metrics,i.candidate_id);let o={part_count:n.size,unique_types:s.size,color_count:r.size,layer_count:a.size};for(let[h,f]of Object.entries(o))et(i.metrics[h]===f,`\u90E8\u54C1\u304B\u3089\u96C6\u8A08\u3057\u305F ${h}\uFF08${f}\uFF09\u304C\u6307\u6A19\uFF08${i.metrics[h]}\uFF09\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002`);if(gc(i.status,e?"BASELINE_APPROVED":"PENDING"),e){let h=i.visual_approval;et(le(h)&&Yd.has(h.scope)&&h.selected_candidate_id===t&&/^[0-9a-f]{64}$/i.test(h.baseline_manifest_sha256)&&h.derivative_joint_review==="PENDING_PHYSICAL_TEST","\u5916\u89B3\u57FA\u6E96\u306E\u9078\u629E\u7BC4\u56F2\u3001\u57FA\u6E96\u30CF\u30C3\u30B7\u30E5\u3001\u307E\u305F\u306F\u63A5\u5408\u90E8\u306E\u5B9F\u6A5F\u8A66\u9A13\u5F85\u3061\u5BA3\u8A00\u304C\u4E0D\u6B63\u3067\u3059\u3002"),et(Pe(i.metrics.baseline_part_count)&&i.metrics.baseline_part_count>0,"\u5916\u89B3\u57FA\u6E96\u306E\u90E8\u54C1\u6570\u304C\u3042\u308A\u307E\u305B\u3093\u3002")}mc(i.warnings);let l=i.assembly;et(le(l),"\u63A5\u89E6\u30B0\u30E9\u30D5\u306E assembly \u5B9A\u7FA9\u304C\u3042\u308A\u307E\u305B\u3093\u3002"),et(Pe(l.graph_components)&&l.graph_components>0,"\u63A5\u89E6\u30B0\u30E9\u30D5\u306E\u9023\u7D50\u6210\u5206\u6570\u304C\u4E0D\u6B63\u3067\u3059\u3002"),et(Array.isArray(l.contact_edges),"contact_edges \u306F [\u4E0B\u5074\u90E8\u54C1ID, \u4E0A\u5074\u90E8\u54C1ID, \u63A5\u89E6\u30B9\u30BF\u30C3\u30C9\u6570] \u306E\u914D\u5217\u304C\u5FC5\u8981\u3067\u3059\u3002"),et(Pe(l.contact_edge_count)&&l.contact_edge_count===l.contact_edges.length,"contact_edge_count \u304C contact_edges \u306E\u4EF6\u6570\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002"),et(Pe(l.contact_stud_sites),"contact_stud_sites \u306F\u63A5\u89E6\u30B9\u30BF\u30C3\u30C9\u7DCF\u6570\u306E\u6574\u6570\u304C\u5FC5\u8981\u3067\u3059\u3002"),et(l.mechanical_validation==="UNKNOWN","\u5B9F\u6A5F\u5D4C\u5408\u306F\u672A\u691C\u8A3C\u3067\u3059\u3002mechanical_validation \u306F UNKNOWN \u304C\u5FC5\u8981\u3067\u3059\u3002");let c=new Set,u=0;for(let h of l.contact_edges){et(Array.isArray(h)&&h.length===3&&n.has(h[0])&&n.has(h[1])&&h[0]!==h[1]&&Pe(h[2])&&h[2]>0,"\u63A5\u89E6\u8FBA\u306E\u90E8\u54C1ID\u307E\u305F\u306F\u30B9\u30BF\u30C3\u30C9\u6570\u304C\u4E0D\u6B63\u3067\u3059\u3002");let f=JSON.stringify(h.slice(0,2));et(!c.has(f),"\u63A5\u89E6\u8FBA\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002"),c.add(f),u+=h[2]}et(u===l.contact_stud_sites,"\u63A5\u89E6\u30B9\u30BF\u30C3\u30C9\u6570\u306E\u96C6\u8A08\u304C\u5BA3\u8A00\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002"),et(l.insertion_sweep_validation===void 0||l.insertion_sweep_validation==="UNKNOWN"||e&&["PASS_CONSERVATIVE_VERTICAL","PASS_OCCUPANCY_PENDING_NATIVE_PROFILE"].includes(l.insertion_sweep_validation),e?"\u5DEE\u8FBC\u7D4C\u8DEF\u306E\u9650\u5B9A\u691C\u8A3C\u7BC4\u56F2\u304C\u4E0D\u6B63\u3067\u3059\u3002":"\u5DEE\u8FBC\u7D4C\u8DEF\u306E\u672A\u691C\u8A3C\u5BA3\u8A00\u304C\u4E0D\u6B63\u3067\u3059\u3002");let d=0;for(let h of i.parts)et(h.attach_to===void 0||h.attach_to===null||n.has(h.attach_to)&&h.attach_to!==h.id,`${h.id} \u306E\u63A5\u7D9A\u5148\u5019\u88DC\u304C\u4E0D\u6B63\u3067\u3059\u3002`),et(h.insertion_axis===void 0||["+Z","-Z"].includes(h.insertion_axis),`${h.id} \u306E\u5DEE\u8FBC\u65B9\u5411\u5019\u88DC\u304C\u4E0D\u6B63\u3067\u3059\u3002`),h.insertion_axis==="+Z"&&(d+=1);if(et(l.underside_attachment_count===void 0||l.underside_attachment_count===d,"\u4E0B\u5074\u304B\u3089\u306E\u5F8C\u4ED8\u3051\u5019\u88DC\u6570\u304C\u500B\u5225\u90E8\u54C1\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002"),e){let h=l.aids??[];et(Array.isArray(h),"\u88DC\u52A9\u5177\u306E\u5B9A\u7FA9\u304C\u4E0D\u6B63\u3067\u3059\u3002");let f=new Set;for(let w of h)et(le(w)&&He(w.id)&&!f.has(w.id),"\u88DC\u52A9\u5177ID\u304C\u6B20\u3051\u3066\u3044\u308B\u304B\u3001\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002"),et(w.physical_strength===void 0||w.physical_strength==="UNKNOWN","\u88DC\u52A9\u5177\u306E\u5B9F\u6A5F\u5F37\u5EA6\u306F\u672A\u78BA\u8A8D\u3067\u3059\u3002"),et(w.part_ids===void 0||Array.isArray(w.part_ids)&&w.part_ids.every(E=>n.has(E)),"\u88DC\u52A9\u5177\u306B\u4E0D\u660E\u306A\u90E8\u54C1ID\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u3002"),f.add(w.id);for(let w of i.parts)et((w.required_aids??[]).every(E=>f.has(E)),`${w.id} \u306E\u5FC5\u8981\u306A\u88DC\u52A9\u5177\u304C\u5B9A\u7FA9\u3055\u308C\u3066\u3044\u307E\u305B\u3093\u3002`);let _=l.preparation_steps??[];et(Array.isArray(_),"\u4EEE\u652F\u6301\u306E\u6E96\u5099\u6761\u4EF6\u304C\u4E0D\u6B63\u3067\u3059\u3002");let y=new Set(i.parts.map(w=>w.step)),m=new Set;for(let w of _)et(le(w)&&He(w.id)&&!m.has(w.id)&&f.has(w.aid_id)&&Pe(w.before_part_step)&&y.has(w.before_part_step)&&He(w.instruction),"\u4EEE\u652F\u6301\u306E\u6E96\u5099\u6761\u4EF6\u306B\u4E0D\u660E\u306A\u88DC\u52A9\u5177\u30FB\u9806\u5E8F\u5019\u88DC\u30FB\u8A18\u8FF0\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u3002"),m.add(w.id);let p=i.parts.filter(w=>w.required_aids?.length).length;if(et(l.fixture_supported_parts===void 0||l.fixture_supported_parts===p,"\u88DC\u52A9\u5177\u304C\u5FC5\u8981\u306A\u90E8\u54C1\u6570\u304C\u500B\u5225\u90E8\u54C1\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002"),l.support_risk!==void 0){let w=l.support_risk;et(le(w)&&le(w.counts)&&Object.values(w.counts).every(Pe),"\u4FDD\u6301\u30EA\u30B9\u30AF\u306E\u96C6\u8A08\u304C\u4E0D\u6B63\u3067\u3059\u3002");for(let E of["strength","retention","physical_tipping"])et(w[E]===void 0||w[E]==="UNKNOWN","\u4FDD\u6301\u30EA\u30B9\u30AF\u306E\u5E7E\u4F55\u8A55\u4FA1\u3092\u5B9F\u6A5F\u691C\u8A3C\u306E\u5B8C\u4E86\u3068\u89E3\u91C8\u3067\u304D\u307E\u305B\u3093\u3002");for(let[E,M]of[["self_weight_cantilever","SELF_WEIGHT_CANTILEVER_REQUIRES_RETENTION_OR_TEMPORARY_SUPPORT"],["single_stud","SINGLE_ROUND_STUD_ROTATIONAL_RETENTION_UNKNOWN"],["cradle_retention_required","HANGING_WHISKER_AFTER_CRADLE_REMOVAL"]])w.counts[E]!==void 0&&et(w.counts[E]===i.parts.filter(P=>P.retention_risks?.includes(M)).length,"\u4FDD\u6301\u30EA\u30B9\u30AF\u306E\u4EF6\u6570\u304C\u500B\u5225\u90E8\u54C1\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002")}}return i}function xc(i){et(le(i)&&[1,2].includes(i.schema_version)&&i.units==="mm"&&["body-bottom-center","body-bottom-bbox-center","body-bottom-BBOX-center"].includes(i.origin)&&le(i.types),"\u90E8\u54C1\u5F62\u72B6\u306E\u5F62\u5F0F\u304C\u4E0D\u6B63\u3067\u3059\uFF08mm\u30FB\u672C\u4F53\u5E95\u9762\u4E2D\u5FC3\u539F\u70B9\u304C\u5FC5\u8981\u3067\u3059\uFF09\u3002");for(let[t,e]of Object.entries(i.types)){et(le(e)&&pi(e.cells,2)&&e.cells.every(n=>Pe(n)&&n>0)&&ln(e.pitch_mm)&&ln(e.layer_mm)&&pi(e.body_mm,3)&&e.body_mm.every(ln),`${t} \u306E\u90E8\u54C1\u5BF8\u6CD5\u304C\u4E0D\u6B63\u3067\u3059\u3002`),pc(e,t,i.schema_version===2);for(let n of["stud_diameter_mm","stud_height_mm","socket_depth_mm"])et(ln(e[n]),`${t} \u306E ${n} \u304C\u4E0D\u6B63\u3067\u3059\u3002`);et(Array.isArray(e.vertices)&&e.vertices.length>=3&&e.vertices.every(n=>pi(n,3)),`${t} \u306E\u9802\u70B9\u30C7\u30FC\u30BF\u304C\u4E0D\u6B63\u3067\u3059\u3002`),et(Array.isArray(e.faces)&&e.faces.length>0&&e.faces.every(n=>Array.isArray(n)&&n.length===3&&n.every(s=>Pe(s)&&s<e.vertices.length)&&new Set(n).size===3),`${t} \u306E\u4E09\u89D2\u5F62\u30C7\u30FC\u30BF\u304C\u4E0D\u6B63\u3067\u3059\u3002`),e.stl&&Ie(e.stl)}return i}function yc(i,t){for(let e of new Set(i.parts.map(n=>n.type_id))){let n=i.types[e],s=t.types[e];if(et(s,`${e} \u306E\u5B9F\u90E8\u54C1\u5F62\u72B6\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u4EE3\u66FF\u5F62\u72B6\u306F\u4F5C\u6210\u3057\u307E\u305B\u3093\u3002`),et(n.cells.every((r,a)=>r===s.cells[a])&&n.pitch_mm===s.pitch_mm&&n.layer_mm===s.layer_mm,`${e} \u306E\u914D\u7F6E\u5B9A\u7FA9\u3068\u5B9F\u90E8\u54C1\u5BF8\u6CD5\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002`),n.footprint_cells){et(Array.isArray(s.footprint_cells),`${e} \u306E\u5B9F\u5F62\u72B6\u306B\u5360\u6709\u30BB\u30EB\u5B9A\u7FA9\u304C\u3042\u308A\u307E\u305B\u3093\u3002`);let r=a=>a.map(o=>o.join(",")).sort().join(";");et(r(n.footprint_cells)===r(s.footprint_cells),`${e} \u306E\u5360\u6709\u30BB\u30EB\u3068\u5B9F\u5F62\u72B6\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002`)}}}function vc(i){let t=new Map,e=new Map,n=new Map,s=new Map,r=[...new Set(i.parts.map(l=>l.layer))].sort((l,c)=>l-c),a=[...new Set(i.parts.map(l=>l.step))].sort((l,c)=>l-c);for(let l of i.parts){t.set(l.id,l);let c=`${l.type_id}\0${l.color_id}`;e.has(c)||e.set(c,{typeId:l.type_id,colorId:l.color_id,parts:[]}),e.get(c).parts.push(l),n.set(l.color_id,(n.get(l.color_id)??0)+1),s.set(l.type_id,(s.get(l.type_id)??0)+1)}let o=[...i.parts].sort((l,c)=>Zd.compare(l.id,c.id));return{partsById:t,groups:e,colors:n,types:s,layers:r,steps:a,sortedParts:o}}function bn(i,t,e,n){return e<=0||n<=0?!1:i.layer<=t.layers[Math.min(e,t.layers.length)-1]&&i.step<=t.steps[Math.min(n,t.steps.length)-1]}function bc(i,t,e,n){let s=Math.max(0,Math.min(1,t));return[i.position_mm[0]+(i.position_mm[0]-e[0])*s*.36,i.position_mm[1]+(i.position_mm[1]-e[1])*s*.36,i.position_mm[2]+i.layer*n*s*1.75]}function Mc(i,t,e,n,s,r,a=!1,o=""){let l=e.trim().toLocaleLowerCase("ja");return i.sortedParts.filter(c=>{if(n&&!bn(c,i,s,r)||a&&c.insertion_axis!=="+Z"||o&&c.support_class!==o)return!1;if(!l)return!0;let u=t.palette[c.color_id];return`${c.id} ${c.type_id} ${c.color_id} ${u.name} ${u.hex} ${c.baseline_part_ids?.join(" ")??""} ${c.feature_tags?.join(" ")??""} ${c.retention_risks?.join(" ")??""} ${c.retention_risks?.map(Po).join(" ")??""}`.toLocaleLowerCase("ja").includes(l)})}function Sc(i,t,{baselineOnly:e=!1}={}){let n=[["\u914D\u7F6E\u30DE\u30CB\u30D5\u30A7\u30B9\u30C8","JSON",t.manifest_url],["\u90E8\u54C1\u8868","CSV",t.bom_url],["\u96C6\u8A08\u90E8\u54C1\u8868","CSV",t.summary_bom_url],["\u7D44\u7ACB\u5019\u88DC\u306E\u8A18\u9332","CSV",t.assembly_steps_url],["\u3053\u306E\u6848\u306E\u30CD\u30A4\u30C6\u30A3\u30D6\u7D44\u7ACBCAD","FCSTD",e?null:t.native_assembly_url],["\u6BD4\u8F03\u7528\u30EC\u30F3\u30C0\u30FC","PNG",t.render_url],["Blender\u30B7\u30FC\u30F3","BLEND",t.blend_url],["360\xB0\u30BF\u30FC\u30F3\u30C6\u30FC\u30D6\u30EB","MP4",e?null:t.video_url]],s=e?null:t.native_cad??i.native_cad;if(le(s)){let a=i.stage===Es&&!t.native_cad,o=(l,c)=>a&&c?`${l}\u30FB\u5171\u901A\u8CC7\u6599\uFF08${new URL(Ie(c),"http://local.invalid").pathname.split("/").slice(-2).join("/")}\uFF09`:l;n.push([o("\u30CD\u30A4\u30C6\u30A3\u30D6\u90E8\u54C1CAD",s.fcstd_url),"FCSTD",s.fcstd_url]),n.push([o("\u5D4C\u5408\u8A66\u9A13\u7247CAD",s.coupon_fcstd_url),"FCSTD",s.coupon_fcstd_url]),n.push([o("\u90E8\u54C1CAD\u4EA4\u63DB\u5F62\u5F0F",s.step_url),"STEP",s.step_url]),Array.isArray(s.coupon_stl_urls)&&s.coupon_stl_urls.forEach((l,c)=>n.push([o(`\u5D4C\u5408\u8A66\u9A13\u7247 ${c+1}`,l),"STL",l])),n.push(["\u30CD\u30A4\u30C6\u30A3\u30D6CAD\u306E\u8A3C\u8DE1","JSON",s.evidence_url]),n.push(["\u5D4C\u5408\u8A66\u9A13\u7247\u306E\u691C\u8A0E\u30AC\u30A4\u30C9","JSON",s.guide_url])}n.push(["\u3053\u306E\u6848\u306E\u691C\u8A3C\u8A3C\u8DE1","JSON",t.evidence_url]),!e&&i.evidence_url!==t.evidence_url&&n.push(["\u5168\u4F53\u306E\u691C\u8A3C\u8A3C\u8DE1","JSON",i.evidence_url]),!e&&le(i.comparison_urls)&&n.push(["\u3053\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306E3\u6848\u6BD4\u8F03","JPG",i.comparison_urls[t.character]]),e||n.push(["\u5916\u89B3\u30EC\u30D3\u30E5\u30FC\u7528\u30C7\u30FC\u30BF\u4E00\u5F0F","ZIP",i.review_data_url]);let r=i.stage===Es?a=>cn(a,i.revision):Ie;return n.filter(([,,a])=>!!a).map(([a,o,l])=>({label:a,extension:o,url:r(l)}))}function Jd(i,t){et(Array.isArray(i),"\u8A66\u9A13\u7247\u30BB\u30C3\u30C8\u306E\u5F62\u5F0F\u304C\u4E0D\u6B63\u3067\u3059\u3002");let e=new Set;for(let n of i){et(le(n)&&ln(n.pitch_mm)&&!e.has(n.pitch_mm)&&t.candidates.some(r=>r.pitch_mm===n.pitch_mm),"\u8A66\u9A13\u7247\u306E\u30D4\u30C3\u30C1\u304C\u9078\u629E\u7248\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002"),e.add(n.pitch_mm),et(ln(n.nozzle_recommendation_mm)&&Array.isArray(n.parts)&&n.parts.length>0,"\u8A66\u9A13\u7247\u307E\u305F\u306F\u30CE\u30BA\u30EB\u4EEE\u5B9A\u306E\u5B9A\u7FA9\u304C\u4E0D\u6B63\u3067\u3059\u3002"),et(n.optional_parts===void 0||Array.isArray(n.optional_parts),"\u4EFB\u610F\u306E\u8A66\u9A13\u7247\u306E\u5F62\u5F0F\u304C\u4E0D\u6B63\u3067\u3059\u3002");for(let r of["diametral_clearances_mm","clearances_mm"])n[r]!==void 0&&et(Array.isArray(n[r])&&n[r].length>0&&n[r].every(fr),"\u8A66\u9A13\u7247\u306E\u76F4\u5F84\u5DEE\u6761\u4EF6\u304C\u4E0D\u6B63\u3067\u3059\u3002");for(let r of[...n.parts,...n.optional_parts??[]])et(le(r)&&He(r.label)&&Pe(r.quantity)&&r.quantity>0,"\u8A66\u9A13\u7247\u306E\u540D\u79F0\u307E\u305F\u306F\u6570\u91CF\u304C\u4E0D\u6B63\u3067\u3059\u3002"),et(r.optional===void 0||typeof r.optional=="boolean","\u4EFB\u610F\u306E\u8A66\u9A13\u7247\u306E\u533A\u5206\u304C\u4E0D\u6B63\u3067\u3059\u3002"),cn(r.url,t.revision);let s=n.parts.filter(r=>!r.optional).reduce((r,a)=>r+a.quantity,0);et(n.piece_count===void 0||n.piece_count===s,"\u8A66\u9A13\u7247\u306E\u500B\u6570\u3068\u6570\u91CF\u5185\u8A33\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");for(let r of["instructions_url","plate_url","native_url","layout_url","plate_stl_url","plate_step_url","csv_url","parts_csv_url"])n[r]&&cn(n[r],t.revision)}return i}function mr(i){let t=[i?.insertion_scope,i?.insertion_sweep_scope,...Array.isArray(i?.insertion_sweep_assumptions)?i.insertion_sweep_assumptions:[],i?.independent_order_check?.scope].filter(e=>typeof e=="string"&&e.length>0);return i?.insertion_sweep_validation==="PASS_OCCUPANCY_PENDING_NATIVE_PROFILE"?{label:"\u683C\u5B50\u7D4C\u8DEF\u306E\u307F\u78BA\u8A8D\u30FB\u5B9F\u5F62\u72B6\u7167\u5408\u5F85\u3061",detail:"\u5360\u6709\u30BB\u30EB\u306E\u7D4C\u8DEF\u30C1\u30A7\u30C3\u30AF\u307E\u3067\u306E\u66AB\u5B9A\u7D50\u679C\u3067\u3059\u3002\u30CD\u30A4\u30C6\u30A3\u30D6\u63A5\u5408\u65AD\u9762\u306E\u7167\u5408\u306F\u672A\u5B8C\u4E86\u3067\u3001\u5B9F\u6A5F\u306E\u5D4C\u5408\u30FB\u4FDD\u6301\u529B\u30FB\u5DE5\u5177\u30A2\u30AF\u30BB\u30B9\u3082\u672A\u78BA\u8A8D\u3067\u3059\u3002",sourceDetails:t}:i?.insertion_sweep_validation==="PASS_CONSERVATIVE_VERTICAL"?{label:"\u516C\u79F0\u30FB\u7D14\u4E0A\u4E0B\u7D4C\u8DEF\u306E\u307F\u691C\u67FB\u6E08\u307F",detail:"\u516C\u79F0\u5BF8\u6CD5\u3067\u306E\u7D14\u4E0A\u4E0B\u79FB\u52D5\u3068\u63A5\u5408\u65AD\u9762\u3060\u3051\u306E\u691C\u67FB\u3067\u3059\u3002\u5B9F\u6A5F\u306E\u5D4C\u5408\u30FB\u4FDD\u6301\u529B\u30FB\u5F37\u5EA6\u30FB\u5DE5\u5177\u30A2\u30AF\u30BB\u30B9\u3092\u4FDD\u8A3C\u3057\u307E\u305B\u3093\u3002",sourceDetails:t}:{label:"\u672A\u691C\u8A3C / UNKNOWN",detail:"\u5DEE\u8FBC\u7D4C\u8DEF\u30FB\u5DE5\u5177\u30A2\u30AF\u30BB\u30B9\u306F\u672A\u691C\u8A3C\u3067\u3059\u3002\u5B9F\u6A5F\u3067\u78BA\u8A8D\u6E08\u307F\u306E\u7D44\u7ACB\u8AAC\u660E\u66F8\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",sourceDetails:t}}function wc(i){let t=i.parts.filter(s=>s.required_aids?.length),e=i.assembly.preparation_steps??[],n=i.assembly.aids??[];return{fixtureParts:t.length,steps:e,firstPartStep:e.length?Math.min(...e.map(s=>s.before_part_step)):null,aidCount:new Set(e.map(s=>s.aid_id)).size,allFixturePartsDownward:t.length>0&&t.every(s=>s.insertion_axis==="-Z"),retentionRequiredBeforeRemoval:n.some(s=>s.removal_gate==="DO_NOT_REMOVE_UNTIL_PHYSICAL_RETENTION_CONFIRMED")}}var A=(i,t=document)=>t.querySelector(i),ge=(i,t=document)=>[...t.querySelectorAll(i)],ut=(i,t=1)=>new Intl.NumberFormat("ja-JP",{maximumFractionDigits:t}).format(i);function U(i,t,e){let n=document.createElement(i);return t&&(n.className=t),e!==void 0&&(n.textContent=String(e)),n}function gr(i){let t=U("span","swatch");return t.style.setProperty("--swatch-color",i),t.setAttribute("aria-hidden","true"),t}function fi(i){A("#announcer").textContent=i}function Oi(i,t,e=!1){A("#stage-message-title").textContent=i,A("#stage-message-copy").textContent=t,A("#stage-message").hidden=!1,A("#retry-model").hidden=!e,A("#height-callout").hidden=!0,A("#empty-progress").hidden=!0}function Mn(i,t){i.forEach(e=>e.setAttribute("aria-pressed",String(t(e))))}var Lo=new URL("../../",import.meta.url);function Sn(i){let t=new URL(i.replace(/^\/+/,""),Lo);if(t.origin!==Lo.origin||!t.pathname.startsWith(Lo.pathname))throw new Error("\u516C\u958B\u30A2\u30FC\u30AB\u30A4\u30D6\u5916\u306E\u53C2\u7167\u5148\u306F\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3002");return t.href}async function $n(i,t,{optional:e=!1}={}){let n=AbortSignal.timeout(3e4),s=t?AbortSignal.any([t,n]):n,r;try{r=await fetch(Sn(i),{method:"GET",cache:"no-cache",credentials:"omit",redirect:"error",signal:s})}catch(a){throw t?.aborted?a:new Se(`\u516C\u958B\u30D5\u30A1\u30A4\u30EB\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093: ${i}\u3002\u63A5\u7D9A\u3092\u78BA\u8A8D\u3057\u3066\u518D\u8AAD\u307F\u8FBC\u307F\u3057\u3066\u304F\u3060\u3055\u3044\u3002`)}if(e&&r.status===404)return null;if(!r.ok)throw new Se(`\u30D5\u30A1\u30A4\u30EB\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\uFF08HTTP ${r.status}\uFF09: ${i}`);try{return await r.json()}catch{throw new Se(`JSON\u3068\u3057\u3066\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093: ${i}`)}}var _r=class{#e=null;#t=0;#n=null;#i=null;constructor(){this.refresh=this.refresh.bind(this),A("#refresh-status").addEventListener("click",this.refresh)}setScope(t,e=null,n="\u8868\u793A\u3059\u308B\u7248\u3092\u78BA\u8A8D\u4E2D\u3067\u3059\u3002"){this.#n=t,this.#i=e,this.unavailable=n,this.refresh()}render(t,e,n=!1){let s=A("#freshness");s.className=`freshness freshness-${n?"archived":"unknown"}`,s.dataset.state=n?"ARCHIVED":"UNKNOWN",A(".status-symbol",s).textContent=n?"\u2197":"?",A("#freshness-label").textContent=t,A("#freshness-time").textContent=n?"\u516C\u958B\u6642\u70B9\u306E\u8A18\u9332\u30FB\u5B9F\u7269\u5408\u683C\u3067\u306F\u3042\u308A\u307E\u305B\u3093":"\u516C\u958B\u8A18\u9332\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093",A("#evidence-status").textContent=n?"\u7248\u3092\u56FA\u5B9A\u3057\u305F\u516C\u958B\u30A2\u30FC\u30AB\u30A4\u30D6":"\u4E0D\u660E",A("#evidence-detail").textContent=e,A("#evidence-detail").dataset.state=n?"ARCHIVED":"UNKNOWN"}async refresh(){this.#e?.abort();let t=new AbortController;this.#e=t;let e=++this.#t;if(A("#refresh-status").disabled=!0,!this.#n){this.render("\u516C\u958B\u8A18\u9332\u3092\u78BA\u8A8D\u4E2D",this.unavailable);return}this.render("\u516C\u958B\u8A18\u9332\u3092\u78BA\u8A8D\u4E2D","\u3053\u306E\u7248\u306E\u8A18\u9332\u3092\u8AAD\u307F\u8FBC\u3093\u3067\u3044\u307E\u3059\u3002");try{let n=await $n(this.#n,t.signal);if(n.schema_version!==1||!Array.isArray(n.archived_revisions)||!n.archived_revisions.includes(this.#i)||typeof n.updated!="string"||!/^\d{4}-\d{2}-\d{2}$/.test(n.updated)||n.production_export!=="BLOCKED"||n.physical_fit!=="NOT_VALIDATED"||n.feedback!=="SMALL_PARTS_AND_BLOCKED_HOLES_BEFORE_CLEANING")throw new Se("\u516C\u958B\u8A18\u9332\u306E\u7248\u307E\u305F\u306F\u7269\u7406\u30B2\u30FC\u30C8\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");if(e!==this.#t)return;this.render(`${n.updated} \u516C\u958B\u8A18\u9332`,"4 mm\u63A5\u5408\u90E8\u306E\u521D\u56DE\u8A66\u4F5C\u3067\u300C\u5C0F\u3055\u304F\u3066\u4F5C\u308A\u306B\u304F\u3044\u300D\u300C\u7A74\u304C\u6A39\u8102\u3067\u57CB\u307E\u308B\u300D\u3068\u5831\u544A\u3055\u308C\u3066\u3044\u307E\u3059\u3002\u7A74\u8A70\u307E\u308A\u306F\u8D85\u97F3\u6CE2\u6D17\u6D44\u524D\u304B\u3089\u767A\u751F\u3002\u539F\u56E0\u30FB\u6761\u4EF6\u5225\u306E\u4FDD\u6301\u529B\u30FB\u5168\u4F53\u7D44\u7ACB\u306F\u672A\u78BA\u5B9A\u3067\u3059\u30026 mm\uFF0F8 mm\u3084Phase1\u306E\u6570\u5024\u691C\u67FB\u306F\u3001\u5B9F\u7269\u5408\u683C\u306E\u8A3C\u62E0\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u5168\u6570\u5370\u5237\u306F\u4FDD\u7559\u3002\u3053\u308C\u306F\u516C\u958B\u6642\u70B9\u306E\u56FA\u5B9A\u8A18\u9332\u3067\u3042\u308A\u3001\u5236\u4F5C\u74B0\u5883\u3092\u76E3\u8996\u3059\u308BAPI\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",!0)}catch(n){if(e!==this.#t||t.signal.aborted)return;this.render("\u516C\u958B\u8A18\u9332\u3092\u8AAD\u3081\u307E\u305B\u3093",`${n.message} \u518D\u78BA\u8A8D\u30DC\u30BF\u30F3\u3067\u3084\u308A\u76F4\u3057\u3066\u304F\u3060\u3055\u3044\u3002`)}finally{e===this.#t&&(A("#refresh-status").disabled=!1)}}dispose(){this.#t+=1,this.#e?.abort(),A("#refresh-status").removeEventListener("click",this.refresh)}},No=[],Do=0;function Ec(){for(;Do<4&&No.length;){let{url:i,signal:t,resolve:e}=No.shift();Do+=1,fetch(Sn(i),{method:"HEAD",credentials:"omit",redirect:"error",signal:t?AbortSignal.any([t,AbortSignal.timeout(2e4)]):AbortSignal.timeout(2e4)}).then(n=>e(n.ok&&!n.headers.get("content-type")?.includes("text/html")&&n.headers.get("content-length")!=="0")).catch(()=>e(!1)).finally(()=>{Do-=1,Ec()})}}function Uo(i,t){return new Promise(e=>{No.push({url:i,signal:t,resolve:e}),Ec()})}function Tc(i,t){let e=A("#catalog-error");e.replaceChildren(U("span","",i));let n=U("button","button secondary compact","\u518D\u8AAD\u307F\u8FBC\u307F");n.type="button",n.addEventListener("click",t),e.append(n),e.hidden=!1}function Kd(){let i=document.createElementNS("http://www.w3.org/2000/svg","svg");i.setAttribute("viewBox","0 0 32 32"),i.setAttribute("aria-hidden","true");let t=document.createElementNS("http://www.w3.org/2000/svg","path");return t.setAttribute("d","M5 7h22v18H5ZM8 21l6-6 4 4 3-3 4 5M22 12h.01"),t.setAttribute("fill","none"),t.setAttribute("stroke","currentColor"),t.setAttribute("stroke-width","1.4"),t.setAttribute("stroke-linecap","round"),i.append(t),i}function Ac(i,t,e={kind:"phase1"}){let n=A("#gallery"),s=e.kind==="phase1";n.replaceChildren(),n.classList.toggle("selected-gallery",!s),A("#comparison-title").textContent=s?`${i.candidates.length}\u3064\u306E\u6848\u3001\u540C\u3058\u76EE\u7DDA\u3067\u3002`:e.kind==="baseline"?"\u9078\u629E\u6E08\u307F3\u6848\u306E\u5916\u89B3\u57FA\u6E96\uFF08\u65E7\u5F62\u72B6\uFF09\u3002":"\u9078\u629E\u6E08\u307F3\u6848\u306E\u63A5\u5408\u90E8\u8A66\u4F5C\u3002";for(let[r,a]of Object.entries(hn)){let o=U("div",s?"gallery-row":"selected-gallery-item"),l=U("div","gallery-row-heading"),c=U("i",`character-dot ${r}-dot`);c.setAttribute("aria-hidden","true"),l.append(c,U("h3","",a.name),U("span","",`${a.short} / \u7D04180 mm`)),o.append(l);for(let[u,d]of Object.entries(Pn)){let h=i.candidates.find(C=>C.character===r&&C.style===u);if(!h){if(!s)continue;let C=U("div","gallery-unavailable",`${d.name}\uFF1A\u672A\u751F\u6210`);o.append(C);continue}let f=U("button","gallery-card");f.type="button",f.dataset.candidate=h.id,f.setAttribute("aria-pressed","false");let _=e.kind==="baseline"?"Phase1\u5916\u89B3\u57FA\u6E96\u30FB\u65E7\u5F62\u72B6":s?"Phase1\u5C65\u6B74":`${i.revision}\u306E\u63A5\u5408\u90E8\u8A66\u4F5C${e.kind==="preview"?"\u30FB\u7248\u6307\u5B9A\u30D7\u30EC\u30D3\u30E5\u30FC":""}`;f.setAttribute("aria-label",`${a.name}\u30FB${d.name}\u3001${ut(h.metrics.part_count,0)}\u500B\u3002${_}\u3092\u30B9\u30BF\u30B8\u30AA\u3067\u8868\u793A`);let y=U("span","gallery-image"),m=U("span","image-placeholder"),p=U("span","","\u30EC\u30F3\u30C0\u30FC\u3092\u78BA\u8A8D\u4E2D");if(m.append(Kd(),p,U("small","","\u5B9F\u969B\u306E\u30EC\u30F3\u30C0\u30FC\u304C\u3067\u304D\u308B\u307E\u3067\u3001\u4EE3\u66FF\u753B\u50CF\u306F\u8868\u793A\u3057\u307E\u305B\u3093\u3002")),y.append(m),h.render_url){let C=U("img");C.alt=`${a.name}\u30FB${d.name}\u3001${_}\u306E\u5B9F\u751F\u6210\u30EC\u30F3\u30C0\u30FC`,C.loading="lazy",C.decoding="async",C.className="gallery-preview-pending",C.setAttribute("aria-hidden","true"),C.addEventListener("load",()=>{C.hidden=!1,C.classList.remove("gallery-preview-pending"),C.removeAttribute("aria-hidden"),m.hidden=!0,f.dataset.renderState="available"}),C.addEventListener("error",()=>{C.hidden=!0,m.hidden=!1,p.textContent="\u30EC\u30F3\u30C0\u30FC\u672A\u751F\u6210\u30FB\u8AAD\u8FBC\u4E0D\u53EF",f.dataset.renderState="missing"}),C.src=Sn(Ie(h.render_url)),y.append(C)}else p.textContent="\u30EC\u30F3\u30C0\u30FC\u672A\u751F\u6210",f.dataset.renderState="missing";y.append(U("span","gallery-selected","\u8868\u793A\u4E2D"));let w=U("span","gallery-meta"),E=U("span","gallery-title");E.append(U("span","",d.name),U("span","","\u2197"));let M=U("span","gallery-numbers"),P=U("span");P.append(U("strong","",ut(h.metrics.part_count,0)),document.createTextNode("\u500B")),M.append(P,U("span","",`${ut(h.pitch_mm)} mm\u30D4\u30C3\u30C1`),U("span","",`${ut(h.metrics.height_mm)} mm\u9AD8`));let R=U("span","gallery-effort",`${h.metrics.approx_build_hours.map(C=>ut(C)).join("\u2013")}\u6642\u9593\uFF08\u63A8\u5B9A\uFF09`);u==="fine"&&(R.classList.add("fine-effort"),R.append(U("span","effort-tag","\u9AD8\u5DE5\u6570"))),w.append(E,M,R),s||w.append(U("span","gallery-scope",_)),f.append(y,w),f.addEventListener("click",()=>t(h.id,!0)),o.append(f)}n.append(o)}jd(i,e)}function Cc(i){Mn(ge(".gallery-card"),t=>t.dataset.candidate===i)}async function jd(i,t){let e=A("#contact-sheet-link"),n=U("span","small-label","\u4E00\u89A7\u753B\u50CF\u3092\u78BA\u8A8D\u4E2D");if(e.replaceChildren(n),!i.contact_sheet_url){n.textContent="\u4E00\u89A7\u753B\u50CF\u306F\u672A\u751F\u6210\u3067\u3059";return}let s=Ie(i.contact_sheet_url);if(await Uo(s)){if(!n.isConnected)return;let r=U("a","button secondary",t.kind==="baseline"?"Phase1\u30FB9\u6848\u306E\u57FA\u6E96\u4E00\u89A7\u753B\u50CF \u2197":`${i.candidates.length}\u6848\u306E\u4E00\u89A7\u753B\u50CF\u3092\u958B\u304F \u2197`);r.href=Sn(s),r.target="_blank",r.rel="noopener",r.setAttribute("aria-label","\u5B9F\u751F\u6210\u306E\u30B3\u30F3\u30BF\u30AF\u30C8\u30B7\u30FC\u30C8\u3092\u65B0\u3057\u3044\u30BF\u30D6\u3067\u958B\u304F"),e.replaceChildren(r)}else n.isConnected&&(n.textContent="\u4E00\u89A7\u753B\u50CF\u306F\u672A\u751F\u6210\u30FB\u8AAD\u8FBC\u4E0D\u53EF\u3067\u3059")}function Qd(i,t,e){let n=U("details","video-details");n.append(U("summary","","360\xB0\u52D5\u753B\u3092\u3053\u306E\u753B\u9762\u3067\u898B\u308B"));let s=U("video");s.controls=!0,s.preload="none",s.playsInline=!0,s.setAttribute("aria-label",`${e.label}\u306E360\u5EA6\u30BF\u30FC\u30F3\u30C6\u30FC\u30D6\u30EB`);let r=U("p","video-caption","\u5B9F\u751F\u6210\u306E\u52D5\u753B\u3067\u3059\u3002\u5206\u89E3\u30FB\u5C64\u306E\u64CD\u4F5C\u306F\u52D5\u753B\u306B\u306F\u53CD\u6620\u3055\u308C\u307E\u305B\u3093\u3002");s.addEventListener("error",()=>{r.textContent="\u52D5\u753B\u3092\u518D\u751F\u3067\u304D\u307E\u305B\u3093\u3002\u30D5\u30A1\u30A4\u30EB\u3092\u53D6\u5F97\u3057\u3066\u3001\u5BFE\u5FDC\u30D7\u30EC\u30FC\u30E4\u30FC\u3067\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"}),n.addEventListener("toggle",()=>{if(n.open&&!s.dataset.loaded){s.preload="metadata";let a=U("source");a.type="video/mp4",a.src=Sn(i),s.append(a),s.dataset.loaded="true",s.load()}n.open||s.pause()}),n.append(s,r),t.append(n)}async function xr(i,t,e){let n=U("div","download-row download-pending"),s=U("span","download-unavailable");s.append(U("span","",t.label),U("small","","\u78BA\u8A8D\u4E2D")),n.append(s),i.append(n);let r=await Uo(t.url,e);if(e?.aborted||!n.isConnected)return!1;if(n.classList.remove("download-pending"),!r)return A("small",s).textContent="\u672A\u751F\u6210\u30FB\u8AAD\u8FBC\u4E0D\u53EF",n.dataset.available="false",!1;let a=U("a");return a.href=Sn(t.url),a.setAttribute("download",""),a.append(U("span","",t.label),U("span","download-extension",t.extension),U("span","download-arrow","\u2193")),a.setAttribute("aria-label",`${t.label}\u3092\u53D6\u5F97\uFF08${t.extension}\u30FB\u691C\u8A0E\u7528\uFF09`),n.replaceChildren(a),n.dataset.available="true",!0}async function Rc(i,t,e,n={kind:"phase1"}){let s=A("#downloads"),r=A("#video-preview");A("video",r)?.pause(),r.replaceChildren(),s.replaceChildren();let a;try{a=Sc(i,t,{baselineOnly:n.kind==="baseline"})}catch(o){s.append(U("p","section-empty",`\u53D6\u5F97\u5148\u306E\u5B9A\u7FA9\u304C\u4E0D\u6B63\u3067\u3059\u3002${o.message}`));return}await Promise.all(a.map(async o=>{await xr(s,o,e)&&!e.aborted&&o.extension==="MP4"&&Qd(o.url,r,t)}))}var yr=12,vr=class{constructor(t){this.onSelect=t,this.page=0,this.bomMode="colors",this.selectedId=null,A("#part-search").addEventListener("input",()=>{this.page=0,this.renderList()}),A("#only-visible").addEventListener("change",()=>{this.page=0,this.renderList()}),A("#only-underside").addEventListener("change",()=>{this.page=0,this.renderList()}),A("#support-filter").addEventListener("change",()=>{this.page=0,this.renderList()}),A("#parts-prev").addEventListener("click",()=>{this.page=Math.max(0,this.page-1),this.renderList()}),A("#parts-next").addEventListener("click",()=>{this.page+=1,this.renderList()}),ge("[data-bom]").forEach(e=>e.addEventListener("click",()=>{this.bomMode=e.dataset.bom,Mn(ge("[data-bom]"),n=>n===e),this.renderBOM()}))}clear(){this.manifest=null,this.index=null,this.page=0,this.selectedId=null,A("#part-search").value="",A("#part-search").disabled=!0,A("#only-visible").checked=!1,A("#only-visible").disabled=!0,A("#only-underside").checked=!1,A("#only-underside").disabled=!0,A("#support-filter").value="",A("#support-filter").disabled=!0,A("#support-filter-control").hidden=!0,A("#part-list").replaceChildren(),A("#part-list-count").textContent="\u2014",A("#search-status").textContent="\u30E2\u30C7\u30EB\u3092\u8AAD\u307F\u8FBC\u3080\u3068\u90E8\u54C1\u3092\u691C\u7D22\u3067\u304D\u307E\u3059\u3002",A("#parts-page").textContent="\u2014",A("#parts-prev").disabled=!0,A("#parts-next").disabled=!0,A("#bom-summary").textContent="\u2014",A("#bom-table").replaceChildren(U("p","section-empty","\u30E2\u30C7\u30EB\u306E\u8AAD\u307F\u8FBC\u307F\u5F8C\u306B\u69CB\u6210\u3092\u8868\u793A\u3057\u307E\u3059\u3002")),this.renderSelected(null)}load(t,e,n){this.clear(),this.manifest=t,this.index=e,this.progress=n,A("#part-search").disabled=!1,A("#only-visible").disabled=!1,A("#only-underside").disabled=!1,A("#support-filter").disabled=t.schema_version!==2,A("#support-filter-control").hidden=t.schema_version!==2;let s=[U("option","","\u3059\u3079\u3066\u306E\u533A\u5206")];s[0].value="";for(let r of new Set(t.parts.map(a=>a.support_class).filter(Boolean))){let a=U("option","",Fi[r]);a.value=r,s.push(a)}A("#support-filter").replaceChildren(...s),A("#part-list-count").textContent=`\u5168 ${ut(t.parts.length,0)} \u500B`,A("#bom-summary").textContent=`${e.colors.size}\u8272 / ${e.types.size}\u578B`,this.renderList(),this.renderBOM()}setProgress(t){this.progress=t,this.manifest&&(A("#only-visible").checked?this.renderList():ge(".part-row").forEach(e=>{let n=this.index.partsById.get(e.dataset.partId),s=this.visible(n);e.classList.toggle("part-row-hidden",!s),e.setAttribute("aria-label",this.partLabel(n))}),this.renderSelected(this.selectedId))}visible(t){return bn(t,this.index,this.progress.layers,this.progress.steps)}partLabel(t){return`${t.id}\u3001${t.type_id}\u3001${this.manifest.palette[t.color_id].name}\u3001\u7B2C${t.layer+1}\u5C64\u3001\u9806\u5E8F\u5019\u88DC${t.step}${t.insertion_axis==="+Z"?"\u3001\u4E0B\u5074\u304B\u3089\u306E\u5F8C\u4ED8\u3051\u5019\u88DC":""}${t.support_class?`\u3001${Fi[t.support_class]}`:""}${this.visible(t)?"":"\u3001\u73FE\u5728\u306F\u975E\u8868\u793A"}\u3002\u9078\u629E`}renderList(){if(!this.manifest)return;let t=Mc(this.index,this.manifest,A("#part-search").value,A("#only-visible").checked,this.progress.layers,this.progress.steps,A("#only-underside").checked,A("#support-filter").value),e=Math.max(1,Math.ceil(t.length/yr));this.page=Math.min(this.page,e-1),A("#search-status").textContent=t.length?`${ut(t.length,0)} \u500B\u306E\u90E8\u54C1\u304C\u898B\u3064\u304B\u308A\u307E\u3057\u305F`:"\u4E00\u81F4\u3059\u308B\u90E8\u54C1\u304C\u3042\u308A\u307E\u305B\u3093\u3002ID\u30FB\u8272\u540D\u3001\u307E\u305F\u306F\u8868\u793A\u7BC4\u56F2\u3092\u5909\u3048\u3066\u304F\u3060\u3055\u3044\u3002";let n=A("#part-list");n.replaceChildren(),n.start=this.page*yr+1;let s=document.createDocumentFragment();for(let r of t.slice(this.page*yr,(this.page+1)*yr)){let a=U("li"),o=U("button","part-row");o.type="button",o.dataset.partId=r.id,o.classList.toggle("part-row-hidden",!this.visible(r)),o.setAttribute("aria-label",this.partLabel(r)),o.setAttribute("aria-pressed",String(r.id===this.selectedId));let l=U("span","part-row-id",r.id);l.append(U("span","part-row-type",`${r.type_id} \xB7 ${this.manifest.palette[r.color_id].name}`)),r.insertion_axis==="+Z"&&l.append(U("span","part-attachment-tag","\u4E0B\u5074\u304B\u3089\u306E\u5F8C\u4ED8\u3051\u5019\u88DC")),r.support_class&&l.append(U("span","part-support-tag",Fi[r.support_class])),r.retention_risks?.length&&l.append(U("span","part-attachment-tag",`\u4FDD\u6301\u30EA\u30B9\u30AF\u8A18\u9332 ${r.retention_risks.length}\u9805\u76EE\u30FB\u5B9F\u6A5F\u672A\u78BA\u8A8D`)),o.append(gr(this.manifest.palette[r.color_id].hex),l,U("span","part-layer",`L${r.layer+1}`)),o.addEventListener("click",()=>this.onSelect(r.id)),a.append(o),s.append(a)}n.append(s),A("#parts-page").textContent=`${this.page+1} / ${e}`,A("#parts-prev").disabled=this.page===0,A("#parts-next").disabled=this.page>=e-1}renderSelected(t){this.selectedId=t;let e=this.index?.partsById.get(t),n=A("#part-details");if(n.replaceChildren(),A("#clear-selection").hidden=!e,A("#focus-part").hidden=!e,e){let s=this.manifest.palette[e.color_id];n.append(U("p","part-id",e.id));let r=U("dl","part-facts"),a=[["\u578B\u756A",e.type_id],["\u8272",`${s.name} \xB7 ${s.hex}`],["\u5C64",`\u7B2C${e.layer+1}\u5C64\uFF08layer ${e.layer}\uFF09`],["\u9806\u5E8F\u5019\u88DC",ut(e.step,0)],["\u5143\u306E\u4F4D\u7F6E",`${e.position_mm.map(o=>ut(o,3)).join(", ")} mm`],["Z\u56DE\u8EE2",`${e.rotation_z_deg}\xB0`]];if(e.insertion_axis&&(a.push(["\u63A5\u7D9A\u5148\u5019\u88DC",e.attach_to??"\u306A\u3057\uFF08\u958B\u59CB\u5019\u88DC\uFF09"]),a.push(["\u5DEE\u8FBC\u5019\u88DC",e.insertion_axis==="+Z"?"+Z \xB7 \u4E0B\u5074\u304B\u3089\u306E\u5F8C\u4ED8\u3051\u5019\u88DC":"\u2212Z \xB7 \u4E0A\u5074\u304B\u3089\u306E\u5019\u88DC"]),a.push(["\u516C\u79F0\u7D4C\u8DEF",mr(this.manifest.assembly).label])),e.support_class){let o=this.manifest.types[e.type_id];a.push(["\u652F\u6301\u30FB\u4FDD\u6301",Fi[e.support_class]]),a.push(["\u5B9F\u6A5F\u72B6\u614B","\u5D4C\u5408\u30FB\u4FDD\u6301\u529B\u672A\u78BA\u8A8D / UNKNOWN"]),a.push(["\u5360\u6709\u5F62\u72B6",`${o.footprint_cells.length}\u30BB\u30EB / \u5916\u63A5 ${o.cells.join(" \xD7 ")}\u30BB\u30EB`]),a.push(["\u7D44\u307F\u66FF\u3048",e.changed_grouping?"\u57FA\u6E96\u90E8\u54C1\u3092\u7D44\u307F\u66FF\u3048":"\u57FA\u6E96\u306E\u307E\u3068\u307E\u308A\u3092\u7DAD\u6301"])}for(let[o,l]of a){let c=U("div"),u=U("dd",o==="\u8272"?"part-color":"",l);o==="\u8272"&&u.prepend(gr(s.hex)),c.append(U("dt","",o),u),r.append(c)}if(n.append(r),e.retention_risks?.length){let o=U("div","hidden-part-note");o.append(U("strong","","\u4FDD\u6301\u30EA\u30B9\u30AF\u306E\u8A18\u9332\uFF08\u5B9F\u6A5F\u672A\u691C\u8A3C\uFF09"));let l=U("ul");l.append(...e.retention_risks.map(c=>U("li","",Po(c)))),o.append(l),Number.isFinite(e.self_weight_bearing_margin_mm)&&o.append(U("p","",`\u5358\u4F53\u81EA\u91CD\u306E\u5E7E\u4F55\u6295\u5F71\u4F59\u88D5\uFF1A${ut(e.self_weight_bearing_margin_mm,3)} mm`)),o.append(U("p","control-help","\u4E0A\u5C64\u8377\u91CD\u30FB\u5B9F\u969B\u306E\u5145\u586B\u30FB\u885D\u6483\u30FB\u6469\u64E6\u30FB\u4FDD\u6301\u529B\u306E\u8A55\u4FA1\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u516C\u79F0\u7740\u5EA7\u3082\u4FDD\u6301\u306E\u4FDD\u8A3C\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002")),n.append(o)}if(e.baseline_part_ids){let o=U("details","part-source-details");o.append(U("summary","",`\u57FA\u6E96\u90E8\u54C1ID ${ut(e.baseline_part_ids.length,0)}\u4EF6`),U("p","mono",e.baseline_part_ids.join(" / "))),e.feature_tags?.length&&o.append(U("p","",`\u7279\u5FB4\uFF1A${e.feature_tags.join(" / ")}`)),o.append(U("p","control-help","\u57FA\u6E96ID\u306F\u5BFE\u5FDC\u5143\u306E\u60C5\u5831\u3067\u3059\u3002\u5B9F\u6A5F\u3067\u78BA\u8A8D\u6E08\u307F\u306E\u7D44\u7ACB\u30FB\u4FDD\u6301\u3092\u793A\u3057\u307E\u305B\u3093\u3002")),n.append(o)}if(e.required_aids?.length){let o=U("details","part-source-details");o.open=!0,o.append(U("summary","",`\u8A2D\u8A08\u4E0A\u5FC5\u8981\u306A\u4EEE\u652F\u6301\u53F0 ${e.required_aids.length}\u4EF6`));for(let l of e.required_aids){let c=this.manifest.assembly.aids.find(u=>u.id===l);o.append(U("p","mono",c.id)),c.withdrawal_axis&&o.append(U("p","",`\u8A2D\u8A08\u4E0A\u306E\u9000\u907F\u65B9\u5411\uFF1A${c.withdrawal_axis} / \u5B9F\u6A5F\u3067\u306E\u53D6\u308A\u5916\u3057\u306F\u672A\u78BA\u8A8D`)),c.nominal_clearance_check&&o.append(U("p","control-help",`\u9000\u907F\u306E\u683C\u5B50\u30C1\u30A7\u30C3\u30AF\uFF1A${c.nominal_clearance_check}\u3002\u624B\u30FB\u5DE5\u5177\u30FB\u5909\u5F62\u30FB\u4FDD\u6301\u529B\u306E\u78BA\u8A8D\u3068\u306F\u5225\u3067\u3059\u3002`)),c.role&&o.append(U("p","control-help",c.role)),c.removal_gate==="DO_NOT_REMOVE_UNTIL_PHYSICAL_RETENTION_CONFIRMED"&&o.append(U("p","hidden-part-note","\u5B9F\u6A5F\u306E\u4FDD\u6301\u529B\u3092\u78BA\u8A8D\u3059\u308B\u307E\u3067\u3001\u4EEE\u652F\u6301\u53F0\u3092\u5916\u3055\u306A\u3044\u6761\u4EF6\u3067\u3059\u3002"))}o.append(U("p","control-help","\u88DC\u52A9\u5177\u306E\u8A2D\u8A08\u60C5\u5831\u3067\u3059\u30023D\u306E\u672C\u4F53\u90E8\u54C1\u6570\u3084\u521D\u56DE\u306E\u63A5\u5408\u90E8\u8A66\u9A13\u30BB\u30C3\u30C8\u306B\u306F\u542B\u3081\u3066\u3044\u307E\u305B\u3093\u3002")),n.append(o)}if(s.source){let o=U("p","control-help",`\u8272\u306E\u53C2\u7167\u5143\uFF1A${String(s.source)}`);n.append(o)}A("#focus-part").disabled=!this.visible(e),this.visible(e)||n.append(U("p","hidden-part-note","\u3053\u306E\u90E8\u54C1\u306F\u73FE\u5728\u306E\u5C64\u30FB\u624B\u9806\u306E\u7BC4\u56F2\u5916\u3067\u3059\u3002\u9032\u884C\u3092\u9032\u3081\u308B\u30683D\u306B\u8868\u793A\u3055\u308C\u307E\u3059\u3002"))}else{n.append(U("p","selection-empty","3D\u306E\u30D6\u30EA\u30C3\u30AF\u3092\u30AF\u30EA\u30C3\u30AF\u3002\u307E\u305F\u306F\u4E0B\u306E\u90E8\u54C1\u4E00\u89A7\u304B\u3089\u9078\u629E\u3067\u304D\u307E\u3059\u3002"));let s=U("a","inline-link","\u90E8\u54C1ID\u3067\u63A2\u3059 \u2193");s.href="#parts-title",n.append(s)}Mn(ge(".part-row"),s=>s.dataset.partId===t)}renderBOM(){if(!this.manifest)return;let t=U("table");t.setAttribute("aria-label",`\u5B8C\u6210\u5F62\u306E${this.bomMode==="colors"?"\u8272\u5225":this.bomMode==="types"?"\u578B\u5225":"\u8272\u3068\u578B\u5225"}\u90E8\u54C1\u8868`);let e=U("caption","sr-only","\u5C64\u30FB\u624B\u9806\u306B\u3088\u3089\u306A\u3044\u5B8C\u6210\u5F62\u306E\u5168\u30D6\u30EA\u30C3\u30AF\u6570"),n=U("thead"),s=U("tr"),r=U("th","",this.bomMode==="colors"?"\u8272\u30FB\u53C2\u7167\u30AB\u30E9\u30FC":this.bomMode==="types"?"\u578B\u756A\u30FB\u30BB\u30EB\u6570":"\u8272 \xD7 \u578B\u756A");r.scope="col";let a=U("th","","\u500B\u6570");a.scope="col",s.append(r,a),n.append(s);let o=U("tbody"),l;this.bomMode==="colors"?l=[...this.index.colors].map(([d,h])=>({colorId:d,count:h})):this.bomMode==="types"?l=[...this.index.types].map(([d,h])=>({typeId:d,count:h})):l=[...this.index.groups.values()].map(d=>({colorId:d.colorId,typeId:d.typeId,count:d.parts.length})),l.sort((d,h)=>h.count-d.count);for(let d of l){let h=U("tr"),f=U("td");if(d.colorId){let m=this.manifest.palette[d.colorId],p=U("span","bom-color"),w=U("span","bom-color-name",m.name);w.append(U("small","",d.typeId?`${m.hex} \xB7 ${d.typeId}`:`${m.hex} \xB7 ${d.colorId}`)),p.append(gr(m.hex),w),f.append(p),m.source&&(f.title=`\u8272\u306E\u53C2\u7167\u5143: ${String(m.source)}`)}else{let m=this.manifest.types[d.typeId],p=U("span","bom-type",d.typeId);p.append(U("small","",m.footprint_cells?`\u5360\u6709 ${m.footprint_cells.length}\u30BB\u30EB / \u5916\u63A5 ${m.cells.join(" \xD7 ")} \xB7 ${ut(m.pitch_mm)} mm`:`${m.cells.join(" \xD7 ")} \u30BB\u30EB \xB7 ${ut(m.pitch_mm)} mm\u30D4\u30C3\u30C1`)),f.append(p)}let _=U("span","bom-ratio");_.setAttribute("aria-hidden","true");let y=U("span");y.style.setProperty("--ratio",`${d.count/this.manifest.parts.length*100}%`),d.colorId&&y.style.setProperty("--swatch-color",this.manifest.palette[d.colorId].hex),_.append(y),f.append(_),h.append(f,U("td","",ut(d.count,0))),o.append(h)}let c=U("tfoot"),u=U("tr");u.append(U("td","","\u5408\u8A08"),U("td","",ut(this.manifest.parts.length,0))),c.append(u),t.append(e,n,o,c),A("#bom-table").replaceChildren(t)}};function qn(i,t,e){A(i).replaceChildren(document.createTextNode(t),U("small","",e))}function Fo(){qn("#metric-parts","\u2014","\u500B"),qn("#metric-height","\u2014","mm"),qn("#metric-footprint","\u2014","mm"),qn("#metric-time","\u2014","\u6642\u9593"),A("#visible-count").textContent="\u2014",A("#total-count").textContent="\u2014",A("#visible-percent").textContent="\u2014",A("#visible-track").style.width="0%",A("#data-candidate").textContent="\u2014",A("#graph-info").textContent="\u5E7E\u4F55\u63A5\u89E6\u30B0\u30E9\u30D5\u306F\u3001\u5B9F\u6A5F\u306E\u5D4C\u5408\u30FB\u5F37\u5EA6\u30FB\u4FDD\u6301\u529B\u3092\u4FDD\u8A3C\u3057\u307E\u305B\u3093\u3002",A("#model-warnings").hidden=!0,A("#attachment-summary").hidden=!0,A("#variant-context").hidden=!0,A("#baseline-comparison").hidden=!0,A("#current-dimensions").hidden=!0,A("#current-dimensions").replaceChildren(),A("#insertion-status").textContent="\u672A\u691C\u8A3C / UNKNOWN",A("#assembly-setup").hidden=!0,A("#assembly-setup").replaceChildren()}function Pc(i,t,e={kind:"phase1"}){document.body.dataset.character=t.character;let n=hn[t.character],s=Pn[t.style],r=t.style==="fine"?` \xB7 ${ut(t.metrics.part_count,0)}\u90E8\u54C1 / PLA\u5C0F\u578B\u63A5\u5408\u90E8\u306F\u5B9F\u6A5F\u8A66\u9A13\u304C\u524D\u63D0`:"",a=e.kind==="selected"||e.kind==="preview",o=a?` \xB7 ${e.revision}${e.kind==="preview"?" / PREVIEW":""}`:e.kind==="baseline"?" \xB7 PHASE 1\u57FA\u6E96 / \u65E7\u63A5\u5408\u90E8":"";A("#candidate-kicker").textContent=`${s.english.toUpperCase()} \xB7 ${ut(t.pitch_mm)} mm PITCH${o}${r}`,A("#candidate-title").replaceChildren(document.createTextNode(n.name),U("span","variant-name",s.name)),A("#candidate-id").textContent=t.id,document.title=`${n.name} \xB7 ${s.name} \u2014 Octoprints / Brick study`,Mn(ge("button[data-character]"),d=>d.dataset.character===t.character),Mn(ge("button[data-style]"),d=>d.dataset.style===t.style),ge("button[data-character]").forEach(d=>{d.disabled=!i.candidates.some(h=>h.character===d.dataset.character)}),ge("button[data-style]").forEach(d=>{let h=i.candidates.find(f=>f.character===t.character&&f.style===d.dataset.style);d.disabled=!h,A("[data-pitch]",d).textContent=h?`${ut(h.pitch_mm)} mm`:"\u672A\u751F\u6210"});let l=A("#variant-context"),c=t.metrics,u=i.candidates.find(d=>d.character===t.character&&d.style==="balanced");l.dataset.fine=String(t.style==="fine"),l.replaceChildren(U("strong","",e.kind==="baseline"?"\u9078\u629E\u6E08\u307F\u5916\u89B3\u57FA\u6E96\u30FB\u65E7\u5F62\u72B6":a?"\u5916\u89B3\u57FA\u6E96\u9078\u629E\u6E08\u307F\u30FB\u63A5\u5408\u90E8\u306F\u8A66\u4F5C":t.style==="fine"?"\u7D30\u5BC6 / \u9AD8\u5DE5\u6570\u306E\u691C\u8A0E\u6848":"\u5916\u89B3\u3068\u4F5C\u696D\u91CF\u3092\u6BD4\u3079\u308B"),U("span","effort-facts",`${ut(c.part_count,0)}\u500B \xB7 ${c.approx_build_hours.map(d=>ut(d)).join("\u2013")}\u6642\u9593\uFF08\u63A8\u5B9A\uFF09`)),t.style==="fine"&&u&&l.append(U("span","effort-ratio",`\u30D0\u30E9\u30F3\u30B9\u6848\u306E\u7D04${ut(c.part_count/u.metrics.part_count)}\u500D\u306E\u90E8\u54C1\u6570`)),l.append(U("span","effort-disclaimer","\u90E8\u54C1\u5897\u306F\u5916\u89B3\u7CBE\u5EA6\u30FB\u5D4C\u5408\u7CBE\u5EA6\u30FB\u7D44\u7ACB\u3084\u3059\u3055\u3092\u4FDD\u8A3C\u3057\u307E\u305B\u3093\u3002")),l.hidden=!1}function Ic(i,t,e={kind:"phase1"}){let n=i.metrics;qn("#metric-parts",ut(i.parts.length,0),"\u500B"),qn("#metric-height",ut(n.height_mm),"mm"),qn("#metric-footprint",`${ut(n.width_mm)} \xD7 ${ut(n.depth_mm)}`,"mm"),qn("#metric-time",n.approx_build_hours.map(d=>ut(d)).join("\u2013"),"\u6642\u9593"),A("#height-value").textContent=ut(n.height_mm),A("#total-count").textContent=ut(i.parts.length,0),A("#data-candidate").textContent=i.candidate_id;let s=i.assembly,r=mr(s);A("#insertion-status").textContent=r.label,A("#step-help").textContent=`\u5C64\u3068\u9806\u5E8F\u5019\u88DC\u306E\u5171\u901A\u7BC4\u56F2\u3092\u8868\u793A\u3002${r.detail}`;let a=A("#graph-info");if(a.replaceChildren(U("strong","",`\u516C\u79F0\u30B9\u30BF\u30C3\u30C9\u63A5\u89E6\uFF1A${ut(s.graph_components,0)}\u9023\u7D50\u6210\u5206 / ${ut(s.contact_edge_count,0)}\u63A5\u89E6\u8FBA`),document.createTextNode(`\u914D\u7F6E\u4E0A\u306E\u63A5\u89E6\u30B0\u30E9\u30D5\u3067\u3001\u5B9F\u6A5F\u306E\u5D4C\u5408\u30FB\u5F37\u5EA6\u30FB\u4FDD\u6301\u529B\u306E\u4FDD\u8A3C\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002${r.detail}`)),r.sourceDetails.length){let d=U("details","warnings"),h=U("ul");h.append(...r.sourceDetails.map(f=>U("li","",f))),d.append(U("summary","","\u516C\u79F0\u7D4C\u8DEF\u30C1\u30A7\u30C3\u30AF\u306E\u8A18\u8F09\u7BC4\u56F2\u30FB\u524D\u63D0"),h),a.append(d)}if(s.support_risk){let d=s.support_risk,h=U("div","hidden-part-note");h.append(U("strong","","\u4FDD\u6301\u30EA\u30B9\u30AF\uFF08\u5E7E\u4F55\u6761\u4EF6\u306E\u8A18\u9332\u30FB\u5F37\u5EA6UNKNOWN\uFF09"));for(let[f,_]of[["self_weight_cantilever","\u5358\u4F53\u81EA\u91CD\u306E\u7247\u6301\u3061\u6761\u4EF6"],["single_stud","\u4E38\u30B9\u30BF\u30C3\u30C91\u672C"],["cradle_retention_required","\u4EEE\u652F\u6301\u53F0\u64A4\u53BB\u5F8C\u306E\u4FDD\u6301\u6761\u4EF6"]])Number.isFinite(d.counts[f])&&h.append(U("p","",`${_}\uFF1A${ut(d.counts[f],0)}\u90E8\u54C1`));h.append(U("p","control-help","\u91CD\u8907\u3042\u308A\u3002\u5B9F\u969B\u306E\u4E0A\u5C64\u8377\u91CD\u30FB\u5145\u586B\u30FB\u885D\u6483\u30FB\u6469\u64E6\u30FB\u8EE2\u5012\u30FB\u4FDD\u6301\u529B\u306F\u672A\u78BA\u8A8D\u3067\u3059\u3002\u90E8\u54C1ID\u30FB\u578B\u756A\u306B\u52A0\u3048\u300C\u7247\u6301\u3061\u300D\u300C\u4E38\u30B9\u30BF\u30C3\u30C9\u300D\u3067\u3082\u691C\u7D22\u3067\u304D\u307E\u3059\u3002")),d.scope&&h.append(U("p","control-help",d.scope)),a.append(h)}let o=s.underside_attachment_count??i.parts.filter(d=>d.insertion_axis==="+Z").length,l=i.parts.filter(d=>d.required_aids?.length).length;A("#attachment-summary").textContent=`${ut(o,0)}\u90E8\u54C1\u304C\u300C\u4E0B\u5074\u304B\u3089\u306E\u5F8C\u4ED8\u3051\u5019\u88DC\u300D\u3002${l?`${ut(l,0)}\u90E8\u54C1\u306F\u8A2D\u8A08\u4E0A\u306E\u4EEE\u652F\u6301\u53F0\u304C\u5FC5\u8981\u3067\u3059\u3002`:""}\u7D4C\u8DEF\u5224\u5B9A\uFF1A${r.label}\u3002\u5B9F\u6A5F\u7D44\u7ACB\u306F\u672A\u78BA\u8A8D\u3067\u3059\u3002`,A("#attachment-summary").hidden=!1,tu(i),A("#metric-time").title="1\u90E8\u54C1\u3042\u305F\u308A\u306E\u4F5C\u696D\u6642\u9593\u306A\u3069\u304B\u3089\u63A8\u5B9A\u3057\u305F\u691C\u8A0E\u5024\u3067\u3059\u3002\u5B9F\u6E2C\u30FB\u7D44\u7ACB\u4FDD\u8A3C\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002";let c=[...new Set([...t.warnings??[],...i.warnings??[]])];s.graph_components!==1&&c.unshift(`\u5E7E\u4F55\u63A5\u89E6\u30B0\u30E9\u30D5\u304C${s.graph_components}\u6210\u5206\u306B\u5206\u304B\u308C\u3066\u3044\u307E\u3059\u3002\u652F\u3048\u3084\u914D\u7F6E\u306E\u691C\u8A0E\u304C\u5FC5\u8981\u3067\u3059\u3002`),A("#model-warnings").hidden=c.length===0,A("#model-warnings").open=t.style==="fine",A("#warning-count").textContent=`(${c.length})`,A("#warning-list").replaceChildren(...c.map(d=>U("li","",d)));let u=A("#baseline-comparison");u.hidden=e.kind==="phase1",e.kind==="selected"||e.kind==="preview"?(u.textContent=`\u9078\u629E\u6E08\u307F\u5916\u89B3\u57FA\u6E96 ${ut(n.baseline_part_count,0)}\u500B \u2192 \u3053\u306E\u63A5\u5408\u90E8\u8A66\u4F5C ${ut(n.part_count,0)}\u500B\u3002\u90E8\u54C1\u306E\u7D44\u307F\u66FF\u3048\u3092\u542B\u307F\u3001\u5916\u89B3\u306E\u9078\u629E\u304C\u63A5\u5408\u90E8\u306E\u627F\u8A8D\u3092\u610F\u5473\u3059\u308B\u3082\u306E\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002`,eu(n),nu(a,i)):e.kind==="baseline"&&(u.textContent=`\u8868\u793A\u306F\u9078\u629E\u6E08\u307F\u306EPhase1\u57FA\u6E96 ${ut(n.part_count,0)}\u500B\u3067\u3059\u3002\u65E7\u58C1\u539A\u30FB\u65E7\u63A5\u5408\u90E8\u306E\u60C5\u5831\u3067\u3042\u308A\u3001\u65B0\u7248\u306E\u6E2C\u5B9A\u5024\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002`)}function tu(i){let t=wc(i),e=A("#assembly-setup");if(e.replaceChildren(),e.hidden=!t.fixtureParts&&!t.steps.length,!e.hidden){if(e.append(U("strong","",t.firstPartStep===null?"\u4EEE\u652F\u6301\u304C\u5FC5\u8981\u30FB\u6E96\u5099\u6761\u4EF6\u306E\u8A18\u9332\u3092\u78BA\u8A8D":`\u90E8\u54C1\u306E\u9806\u5E8F\u5019\u88DC${ut(t.firstPartStep,0)}\u3088\u308A\u524D\uFF1A\u4EEE\u652F\u6301\u53F0${ut(t.aidCount,0)}\u7A2E\u306E\u6E96\u5099\u304C\u5FC5\u8981`)),t.allFixturePartsDownward&&e.append(U("p","",`\u88DC\u52A9\u5177\u5BFE\u8C61\u306E${ut(t.fixtureParts,0)}\u90E8\u54C1\u3082\u3001\u73FE\u884C\u6848\u306F\u4E0A\u304B\u3089\u4E0B\u3078\uFF08\u2212Z\uFF09\u306E\u914D\u7F6E\u3067\u3059\u3002\u4E0B\u5074\u304B\u3089\u306E\u5F8C\u4ED8\u3051\u6848\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002`)),t.retentionRequiredBeforeRemoval&&e.append(U("p","setup-retention","\u5B9F\u6A5F\u3067\u4FDD\u6301\u529B\u3092\u78BA\u8A8D\u3059\u308B\u307E\u3067\u3001\u4EEE\u652F\u6301\u53F0\u3092\u5916\u3055\u306A\u3044\u6761\u4EF6\u3067\u3059\u3002\u4FDD\u6301\u529B\u30FB\u5F37\u5EA6\u30FB\u5B9F\u6A5F\u306E\u5B89\u5B9A\u6027\u306FUNKNOWN\u3067\u3059\u3002")),t.steps.length){let n=U("details","part-source-details"),s=U("ul");for(let r of t.steps)s.append(U("li","",`${r.aid_id} / \u90E8\u54C1\u306E\u9806\u5E8F\u5019\u88DC${ut(r.before_part_step,0)}\u3088\u308A\u524D\uFF1A${r.instruction}`));n.append(U("summary","","\u5143\u30C7\u30FC\u30BF\u306E\u6E96\u5099\u6761\u4EF6"),s),e.append(n)}e.append(U("p","control-help","\u8A2D\u8A08\u8A18\u9332\u306E\u8868\u793A\u3067\u3059\u3002\u4EEE\u652F\u6301\u53F0\u3084\u6E96\u5099\u3092\u672C\u4F53\u306E\u90E8\u54C1\u6570\u30FB\u7D44\u7ACB\u30B9\u30E9\u30A4\u30C0\u30FC\u306B\u8DB3\u3057\u305F\u308A\u3001\u5B9F\u884C\u30FB\u627F\u8A8D\u3057\u305F\u308A\u306F\u3057\u307E\u305B\u3093\u3002"))}}function eu(i){let t={nominal_min_wall_mm:"\u516C\u79F0\u6700\u5C0F\u58C1\u539A",nominal_roof_mm:"\u516C\u79F0\u5C4B\u6839\u539A",min_socket_mouth_wall_mm:"\u53E3\u5143\u306E\u6700\u5C0F\u58C1\u539A",min_socket_straight_wall_mm:"\u76F4\u90E8\u306E\u6700\u5C0F\u58C1\u539A",minimum_socket_wall_mm:"\u6700\u5C0F\u30BD\u30B1\u30C3\u30C8\u58C1\u539A",min_roof_mm:"\u6700\u5C0F\u5C4B\u6839\u539A",measured_min_wall_mm:"\u5F62\u72B6\u304B\u3089\u306E\u6700\u5C0F\u58C1\u539A",measured_min_roof_mm:"\u5F62\u72B6\u304B\u3089\u306E\u6700\u5C0F\u5C4B\u6839\u539A",bearing_pad_height_mm:"\u7740\u5EA7\u30D1\u30C3\u30C9\u9AD8\u3055",micro_stud_diameter_mm:"\u63A5\u5408\u8EF8\u306E\u516C\u79F0\u5F84"},e=Object.entries(i).filter(([r,a])=>Number.isFinite(a)&&/(?:wall|roof|bearing_pad|micro_stud).*_mm$/.test(r)&&!/baseline|historical|previous|legacy|phase_?1|(?:^|_)old(?:_|$)/i.test(r)),n=A("#current-dimensions");if(n.replaceChildren(),!e.length)return;n.hidden=!1,n.append(U("h4","","\u516C\u79F0\u5BF8\u6CD5\u3068\u691C\u8A3C\u72B6\u614B\uFF08\u3053\u306E\u7248\u306E\u8A18\u8F09\uFF09")),i.wall_measurement_status&&n.append(U("p","control-help",`\u30CD\u30A4\u30C6\u30A3\u30D6\u5BF8\u6CD5\u691C\u8A3C\uFF1A${i.wall_measurement_status}\u3002\u516C\u79F0\u5024\u3068\u5B9F\u5F62\u72B6\u7167\u5408\u306E\u5B8C\u4E86\u306F\u5225\u3067\u3059\u3002`));let s=U("dl","evidence-facts");for(let[r,a]of e){let o=U("div");o.append(U("dt","",t[r]??r),U("dd","",`${ut(a,3)} mm`)),s.append(o)}n.append(s,U("p","control-help","\u58C1\u539A\u3068\u4FDD\u6301\u529B\u306F\u5225\u306E\u691C\u8A3C\u3067\u3059\u3002\u5C0F\u578BPLA\u8EF8\u306E\u5F37\u5EA6\u30FB\u6469\u64E6\u30FB\u4FDD\u6301\u529B\u306F\u5B9F\u6A5F\u672A\u78BA\u8A8D\u3067\u3059\u3002"))}function nu(i,t){let e=t.appearance_preservation,n=t.assembly.support_repairs;if(!e&&!n)return;let s=U("details","warnings"),r=U("ul");if(s.append(U("summary","","\u57FA\u6E96\u3068\u306E\u5DEE\u5206\u30FB\u652F\u6301\u306E\u691C\u8A0E\u8A18\u9332"),r),e){for(let[a,o]of[["occupied_cell_changes","\u5360\u6709\u30BB\u30EB\u306E\u5909\u66F4"],["boundary_color_changes","\u5883\u754C\u8272\u306E\u5909\u66F4"],["potentially_visible_changed_seam_segments","\u898B\u3048\u308B\u53EF\u80FD\u6027\u306E\u3042\u308B\u90E8\u54C1\u5883\u754C\u306E\u5909\u66F4"]])Number.isFinite(e[a])&&r.append(U("li","",`${o}\uFF1A${ut(e[a],0)}`));r.append(U("li","","\u683C\u5B50\u4E0A\u306E\u5916\u5F62\u3068\u5883\u754C\u8272\u306E\u7167\u5408\u3067\u3042\u308A\u3001\u90E8\u54C1\u5883\u754C\u3084\u9023\u7D9A\u66F2\u9762\u306E\u898B\u305F\u76EE\u304C\u5B8C\u5168\u306B\u540C\u4E00\u3068\u3044\u3046\u610F\u5473\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002"))}n&&(typeof n.status=="string"&&r.append(U("li","",`\u652F\u6301\u306E\u518D\u69CB\u6210\uFF1A${n.status}\uFF08\u5B9F\u6A5F\u672A\u78BA\u8A8D\uFF09`)),Number.isFinite(n.unsupported_after)&&r.append(U("li","",`\u672C\u4F53\u306E\u307F\u3067\u306E\u672A\u652F\u6301\u8A18\u9332\uFF1A${ut(n.unsupported_after,0)}\u90E8\u54C1\u3002\u88DC\u52A9\u5177\u6761\u4EF6\u3082\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002`)),Number.isFinite(n.hidden_recolored_cells)&&r.append(U("li","",`\u5185\u90E8\u306E\u8272\u5909\u66F4\u30BB\u30EB\uFF1A${ut(n.hidden_recolored_cells,0)}`))),t.assembly.aids?.length&&r.append(U("li","",`\u4EEE\u652F\u6301\u53F0 ${t.assembly.aids.length}\u7A2E\u306E\u8A2D\u8A08\u60C5\u5831\u3042\u308A\u3002\u521D\u56DE\u63A5\u5408\u90E8\u8A66\u9A13\u3068\u306F\u5225\u67A0\u3067\u3001\u5B9F\u6A5F\u4FDD\u6301\u529B\u306F\u672A\u78BA\u8A8D\u3067\u3059\u3002`)),i.append(s)}function Bi(i,t){for(let e of["explode","layers","steps","previous-step","next-step","show-complete"])A(`#${e}`).disabled=!i;for(let e of ge("[data-view], #reset-view"))e.disabled=!t}function br(i,t,e,n){A("#explode").value=String(Math.round(i.explosion*100)),A("#explode-value").textContent=`${Math.round(i.explosion*100)}%`,A("#explode").setAttribute("aria-valuetext",i.explosion===0?"\u5B8C\u6210\u5F62":`${Math.round(i.explosion*100)}\u30D1\u30FC\u30BB\u30F3\u30C8\u5206\u89E3`),A("#layers").max=String(t.layers.length),A("#layers").value=String(i.layers),A("#layer-value").textContent=`${ut(i.layers,0)} / ${ut(t.layers.length,0)} \u5C64`,A("#layers").setAttribute("aria-valuetext",`${t.layers.length}\u5C64\u306E\u3046\u3061\u4E0B\u304B\u3089${i.layers}\u5C64\u307E\u3067`),A("#steps").max=String(t.steps.length),A("#steps").value=String(i.steps),A("#step-value").textContent=`${ut(i.steps,0)} / ${ut(t.steps.length,0)}`,A("#steps").setAttribute("aria-valuetext",i.steps===0?"\u958B\u59CB\u524D\u3001\u8868\u793A\u90E8\u54C1\u306A\u3057":`${t.steps.length}\u4EF6\u306E\u9806\u5E8F\u5019\u88DC\u306E\u3046\u3061${i.steps}\u756A\u76EE\u3001\u5019\u88DCID ${t.steps[i.steps-1]}\u307E\u3067\u3002\u5DEE\u8FBC\u7D4C\u8DEF\u306F\u672A\u691C\u8A3C`),A("#previous-step").disabled=i.steps===0,A("#next-step").disabled=i.steps===t.steps.length,A("#visible-count").textContent=ut(e,0),A("#visible-percent").textContent=`${Math.round(e/n*100)}%`,A("#visible-track").style.width=`${e/n*100}%`,A("#empty-progress").hidden=e!==0||!A("#stage-message").hidden}var oi={LEFT:0,MIDDLE:1,RIGHT:2,ROTATE:0,DOLLY:1,PAN:2},li={ROTATE:0,PAN:1,DOLLY_PAN:2,DOLLY_ROTATE:3},ah=0,ml=1,oh=2;var gl=1,_a=2,Tn=3,Bn=0,ke=1,An=2,Vn=0,vi=1,_l=2,xl=3,yl=4,lh=5,ni=100,ch=101,hh=102,dh=103,uh=104,ph=200,fh=201,mh=202,gh=203,Wr=204,Xr=205,_h=206,xh=207,yh=208,vh=209,bh=210,Mh=211,Sh=212,wh=213,Eh=214,xa=0,ya=1,va=2,bi=3,ba=4,Ma=5,Sa=6,wa=7,vl=0,Th=1,Ah=2,Hn=0,Ch=1,Rh=2,Ph=3,Ea=4,Ih=5,Lh=6,Dh=7;var bl=300,Ai=301,Ci=302,Ta=303,Aa=304,ir=306,$r=1e3,ei=1001,qr=1002,We=1003,Nh=1004;var sr=1005;var mn=1006,Ca=1007;var ci=1008;var xn=1009,Ml=1010,Sl=1011,cs=1012,Ra=1013,hi=1014,yn=1015,hs=1016,Pa=1017,Ia=1018,ds=1020,wl=35902,El=35899,Tl=1021,Al=1022,on=1023,ts=1026,us=1027,La=1028,Da=1029,Cl=1030,Na=1031;var Ua=1033,rr=33776,ar=33777,or=33778,lr=33779,Fa=35840,Oa=35841,Ba=35842,za=35843,ka=36196,Va=37492,Ha=37496,Ga=37808,Wa=37809,Xa=37810,$a=37811,qa=37812,Ya=37813,Za=37814,Ja=37815,Ka=37816,ja=37817,Qa=37818,to=37819,eo=37820,no=37821,io=36492,so=36494,ro=36495,ao=36283,oo=36284,lo=36285,co=36286;var Us=2300,Yr=2301,Gr=2302,al=2400,ol=2401,ll=2402;var Uh=3200,Fh=3201;var Rl=0,Oh=1,Gn="",ze="srgb",Mi="srgb-linear",Fs="linear",Kt="srgb";var yi=7680;var cl=519,Bh=512,zh=513,kh=514,Pl=515,Vh=516,Hh=517,Gh=518,Wh=519,hl=35044,Il=35048;var Ll="300 es",fn=2e3,Os=2001;var wn=class{addEventListener(t,e){this._listeners===void 0&&(this._listeners={});let n=this._listeners;n[t]===void 0&&(n[t]=[]),n[t].indexOf(e)===-1&&n[t].push(e)}hasEventListener(t,e){let n=this._listeners;return n===void 0?!1:n[t]!==void 0&&n[t].indexOf(e)!==-1}removeEventListener(t,e){let n=this._listeners;if(n===void 0)return;let s=n[t];if(s!==void 0){let r=s.indexOf(e);r!==-1&&s.splice(r,1)}}dispatchEvent(t){let e=this._listeners;if(e===void 0)return;let n=e[t.type];if(n!==void 0){t.target=this;let s=n.slice(0);for(let r=0,a=s.length;r<a;r++)s[r].call(this,t);t.target=null}}},Le=["00","01","02","03","04","05","06","07","08","09","0a","0b","0c","0d","0e","0f","10","11","12","13","14","15","16","17","18","19","1a","1b","1c","1d","1e","1f","20","21","22","23","24","25","26","27","28","29","2a","2b","2c","2d","2e","2f","30","31","32","33","34","35","36","37","38","39","3a","3b","3c","3d","3e","3f","40","41","42","43","44","45","46","47","48","49","4a","4b","4c","4d","4e","4f","50","51","52","53","54","55","56","57","58","59","5a","5b","5c","5d","5e","5f","60","61","62","63","64","65","66","67","68","69","6a","6b","6c","6d","6e","6f","70","71","72","73","74","75","76","77","78","79","7a","7b","7c","7d","7e","7f","80","81","82","83","84","85","86","87","88","89","8a","8b","8c","8d","8e","8f","90","91","92","93","94","95","96","97","98","99","9a","9b","9c","9d","9e","9f","a0","a1","a2","a3","a4","a5","a6","a7","a8","a9","aa","ab","ac","ad","ae","af","b0","b1","b2","b3","b4","b5","b6","b7","b8","b9","ba","bb","bc","bd","be","bf","c0","c1","c2","c3","c4","c5","c6","c7","c8","c9","ca","cb","cc","cd","ce","cf","d0","d1","d2","d3","d4","d5","d6","d7","d8","d9","da","db","dc","dd","de","df","e0","e1","e2","e3","e4","e5","e6","e7","e8","e9","ea","eb","ec","ed","ee","ef","f0","f1","f2","f3","f4","f5","f6","f7","f8","f9","fa","fb","fc","fd","fe","ff"],Lc=1234567,Ds=Math.PI/180,es=180/Math.PI;function ps(){let i=Math.random()*4294967295|0,t=Math.random()*4294967295|0,e=Math.random()*4294967295|0,n=Math.random()*4294967295|0;return(Le[i&255]+Le[i>>8&255]+Le[i>>16&255]+Le[i>>24&255]+"-"+Le[t&255]+Le[t>>8&255]+"-"+Le[t>>16&15|64]+Le[t>>24&255]+"-"+Le[e&63|128]+Le[e>>8&255]+"-"+Le[e>>16&255]+Le[e>>24&255]+Le[n&255]+Le[n>>8&255]+Le[n>>16&255]+Le[n>>24&255]).toLowerCase()}function Ht(i,t,e){return Math.max(t,Math.min(e,i))}function Dl(i,t){return(i%t+t)%t}function iu(i,t,e,n,s){return n+(i-t)*(s-n)/(e-t)}function su(i,t,e){return i!==t?(e-i)/(t-i):0}function Ns(i,t,e){return(1-e)*i+e*t}function ru(i,t,e,n){return Ns(i,t,1-Math.exp(-e*n))}function au(i,t=1){return t-Math.abs(Dl(i,t*2)-t)}function ou(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*(3-2*i))}function lu(i,t,e){return i<=t?0:i>=e?1:(i=(i-t)/(e-t),i*i*i*(i*(i*6-15)+10))}function cu(i,t){return i+Math.floor(Math.random()*(t-i+1))}function hu(i,t){return i+Math.random()*(t-i)}function du(i){return i*(.5-Math.random())}function uu(i){i!==void 0&&(Lc=i);let t=Lc+=1831565813;return t=Math.imul(t^t>>>15,t|1),t^=t+Math.imul(t^t>>>7,t|61),((t^t>>>14)>>>0)/4294967296}function pu(i){return i*Ds}function fu(i){return i*es}function mu(i){return(i&i-1)===0&&i!==0}function gu(i){return Math.pow(2,Math.ceil(Math.log(i)/Math.LN2))}function _u(i){return Math.pow(2,Math.floor(Math.log(i)/Math.LN2))}function xu(i,t,e,n,s){let r=Math.cos,a=Math.sin,o=r(e/2),l=a(e/2),c=r((t+n)/2),u=a((t+n)/2),d=r((t-n)/2),h=a((t-n)/2),f=r((n-t)/2),_=a((n-t)/2);switch(s){case"XYX":i.set(o*u,l*d,l*h,o*c);break;case"YZY":i.set(l*h,o*u,l*d,o*c);break;case"ZXZ":i.set(l*d,l*h,o*u,o*c);break;case"XZX":i.set(o*u,l*_,l*f,o*c);break;case"YXY":i.set(l*f,o*u,l*_,o*c);break;case"ZYZ":i.set(l*_,l*f,o*u,o*c);break;default:console.warn("THREE.MathUtils: .setQuaternionFromProperEuler() encountered an unknown order: "+s)}}function ji(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return i/4294967295;case Uint16Array:return i/65535;case Uint8Array:return i/255;case Int32Array:return Math.max(i/2147483647,-1);case Int16Array:return Math.max(i/32767,-1);case Int8Array:return Math.max(i/127,-1);default:throw new Error("Invalid component type.")}}function Be(i,t){switch(t.constructor){case Float32Array:return i;case Uint32Array:return Math.round(i*4294967295);case Uint16Array:return Math.round(i*65535);case Uint8Array:return Math.round(i*255);case Int32Array:return Math.round(i*2147483647);case Int16Array:return Math.round(i*32767);case Int8Array:return Math.round(i*127);default:throw new Error("Invalid component type.")}}var Wn={DEG2RAD:Ds,RAD2DEG:es,generateUUID:ps,clamp:Ht,euclideanModulo:Dl,mapLinear:iu,inverseLerp:su,lerp:Ns,damp:ru,pingpong:au,smoothstep:ou,smootherstep:lu,randInt:cu,randFloat:hu,randFloatSpread:du,seededRandom:uu,degToRad:pu,radToDeg:fu,isPowerOfTwo:mu,ceilPowerOfTwo:gu,floorPowerOfTwo:_u,setQuaternionFromProperEuler:xu,normalize:Be,denormalize:ji},Dt=class i{constructor(t=0,e=0){i.prototype.isVector2=!0,this.x=t,this.y=e}get width(){return this.x}set width(t){this.x=t}get height(){return this.y}set height(t){this.y=t}set(t,e){return this.x=t,this.y=e,this}setScalar(t){return this.x=t,this.y=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y)}copy(t){return this.x=t.x,this.y=t.y,this}add(t){return this.x+=t.x,this.y+=t.y,this}addScalar(t){return this.x+=t,this.y+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this}subScalar(t){return this.x-=t,this.y-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this}multiply(t){return this.x*=t.x,this.y*=t.y,this}multiplyScalar(t){return this.x*=t,this.y*=t,this}divide(t){return this.x/=t.x,this.y/=t.y,this}divideScalar(t){return this.multiplyScalar(1/t)}applyMatrix3(t){let e=this.x,n=this.y,s=t.elements;return this.x=s[0]*e+s[3]*n+s[6],this.y=s[1]*e+s[4]*n+s[7],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this}clamp(t,e){return this.x=Ht(this.x,t.x,e.x),this.y=Ht(this.y,t.y,e.y),this}clampScalar(t,e){return this.x=Ht(this.x,t,e),this.y=Ht(this.y,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ht(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this}negate(){return this.x=-this.x,this.y=-this.y,this}dot(t){return this.x*t.x+this.y*t.y}cross(t){return this.x*t.y-this.y*t.x}lengthSq(){return this.x*this.x+this.y*this.y}length(){return Math.sqrt(this.x*this.x+this.y*this.y)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)}normalize(){return this.divideScalar(this.length()||1)}angle(){return Math.atan2(-this.y,-this.x)+Math.PI}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ht(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y;return e*e+n*n}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this}equals(t){return t.x===this.x&&t.y===this.y}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this}rotateAround(t,e){let n=Math.cos(e),s=Math.sin(e),r=this.x-t.x,a=this.y-t.y;return this.x=r*n-a*s+t.x,this.y=r*s+a*n+t.y,this}random(){return this.x=Math.random(),this.y=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y}},Ue=class{constructor(t=0,e=0,n=0,s=1){this.isQuaternion=!0,this._x=t,this._y=e,this._z=n,this._w=s}static slerpFlat(t,e,n,s,r,a,o){let l=n[s+0],c=n[s+1],u=n[s+2],d=n[s+3],h=r[a+0],f=r[a+1],_=r[a+2],y=r[a+3];if(o===0){t[e+0]=l,t[e+1]=c,t[e+2]=u,t[e+3]=d;return}if(o===1){t[e+0]=h,t[e+1]=f,t[e+2]=_,t[e+3]=y;return}if(d!==y||l!==h||c!==f||u!==_){let m=1-o,p=l*h+c*f+u*_+d*y,w=p>=0?1:-1,E=1-p*p;if(E>Number.EPSILON){let P=Math.sqrt(E),R=Math.atan2(P,p*w);m=Math.sin(m*R)/P,o=Math.sin(o*R)/P}let M=o*w;if(l=l*m+h*M,c=c*m+f*M,u=u*m+_*M,d=d*m+y*M,m===1-o){let P=1/Math.sqrt(l*l+c*c+u*u+d*d);l*=P,c*=P,u*=P,d*=P}}t[e]=l,t[e+1]=c,t[e+2]=u,t[e+3]=d}static multiplyQuaternionsFlat(t,e,n,s,r,a){let o=n[s],l=n[s+1],c=n[s+2],u=n[s+3],d=r[a],h=r[a+1],f=r[a+2],_=r[a+3];return t[e]=o*_+u*d+l*f-c*h,t[e+1]=l*_+u*h+c*d-o*f,t[e+2]=c*_+u*f+o*h-l*d,t[e+3]=u*_-o*d-l*h-c*f,t}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get w(){return this._w}set w(t){this._w=t,this._onChangeCallback()}set(t,e,n,s){return this._x=t,this._y=e,this._z=n,this._w=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._w)}copy(t){return this._x=t.x,this._y=t.y,this._z=t.z,this._w=t.w,this._onChangeCallback(),this}setFromEuler(t,e=!0){let n=t._x,s=t._y,r=t._z,a=t._order,o=Math.cos,l=Math.sin,c=o(n/2),u=o(s/2),d=o(r/2),h=l(n/2),f=l(s/2),_=l(r/2);switch(a){case"XYZ":this._x=h*u*d+c*f*_,this._y=c*f*d-h*u*_,this._z=c*u*_+h*f*d,this._w=c*u*d-h*f*_;break;case"YXZ":this._x=h*u*d+c*f*_,this._y=c*f*d-h*u*_,this._z=c*u*_-h*f*d,this._w=c*u*d+h*f*_;break;case"ZXY":this._x=h*u*d-c*f*_,this._y=c*f*d+h*u*_,this._z=c*u*_+h*f*d,this._w=c*u*d-h*f*_;break;case"ZYX":this._x=h*u*d-c*f*_,this._y=c*f*d+h*u*_,this._z=c*u*_-h*f*d,this._w=c*u*d+h*f*_;break;case"YZX":this._x=h*u*d+c*f*_,this._y=c*f*d+h*u*_,this._z=c*u*_-h*f*d,this._w=c*u*d-h*f*_;break;case"XZY":this._x=h*u*d-c*f*_,this._y=c*f*d-h*u*_,this._z=c*u*_+h*f*d,this._w=c*u*d+h*f*_;break;default:console.warn("THREE.Quaternion: .setFromEuler() encountered an unknown order: "+a)}return e===!0&&this._onChangeCallback(),this}setFromAxisAngle(t,e){let n=e/2,s=Math.sin(n);return this._x=t.x*s,this._y=t.y*s,this._z=t.z*s,this._w=Math.cos(n),this._onChangeCallback(),this}setFromRotationMatrix(t){let e=t.elements,n=e[0],s=e[4],r=e[8],a=e[1],o=e[5],l=e[9],c=e[2],u=e[6],d=e[10],h=n+o+d;if(h>0){let f=.5/Math.sqrt(h+1);this._w=.25/f,this._x=(u-l)*f,this._y=(r-c)*f,this._z=(a-s)*f}else if(n>o&&n>d){let f=2*Math.sqrt(1+n-o-d);this._w=(u-l)/f,this._x=.25*f,this._y=(s+a)/f,this._z=(r+c)/f}else if(o>d){let f=2*Math.sqrt(1+o-n-d);this._w=(r-c)/f,this._x=(s+a)/f,this._y=.25*f,this._z=(l+u)/f}else{let f=2*Math.sqrt(1+d-n-o);this._w=(a-s)/f,this._x=(r+c)/f,this._y=(l+u)/f,this._z=.25*f}return this._onChangeCallback(),this}setFromUnitVectors(t,e){let n=t.dot(e)+1;return n<1e-8?(n=0,Math.abs(t.x)>Math.abs(t.z)?(this._x=-t.y,this._y=t.x,this._z=0,this._w=n):(this._x=0,this._y=-t.z,this._z=t.y,this._w=n)):(this._x=t.y*e.z-t.z*e.y,this._y=t.z*e.x-t.x*e.z,this._z=t.x*e.y-t.y*e.x,this._w=n),this.normalize()}angleTo(t){return 2*Math.acos(Math.abs(Ht(this.dot(t),-1,1)))}rotateTowards(t,e){let n=this.angleTo(t);if(n===0)return this;let s=Math.min(1,e/n);return this.slerp(t,s),this}identity(){return this.set(0,0,0,1)}invert(){return this.conjugate()}conjugate(){return this._x*=-1,this._y*=-1,this._z*=-1,this._onChangeCallback(),this}dot(t){return this._x*t._x+this._y*t._y+this._z*t._z+this._w*t._w}lengthSq(){return this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w}length(){return Math.sqrt(this._x*this._x+this._y*this._y+this._z*this._z+this._w*this._w)}normalize(){let t=this.length();return t===0?(this._x=0,this._y=0,this._z=0,this._w=1):(t=1/t,this._x=this._x*t,this._y=this._y*t,this._z=this._z*t,this._w=this._w*t),this._onChangeCallback(),this}multiply(t){return this.multiplyQuaternions(this,t)}premultiply(t){return this.multiplyQuaternions(t,this)}multiplyQuaternions(t,e){let n=t._x,s=t._y,r=t._z,a=t._w,o=e._x,l=e._y,c=e._z,u=e._w;return this._x=n*u+a*o+s*c-r*l,this._y=s*u+a*l+r*o-n*c,this._z=r*u+a*c+n*l-s*o,this._w=a*u-n*o-s*l-r*c,this._onChangeCallback(),this}slerp(t,e){if(e===0)return this;if(e===1)return this.copy(t);let n=this._x,s=this._y,r=this._z,a=this._w,o=a*t._w+n*t._x+s*t._y+r*t._z;if(o<0?(this._w=-t._w,this._x=-t._x,this._y=-t._y,this._z=-t._z,o=-o):this.copy(t),o>=1)return this._w=a,this._x=n,this._y=s,this._z=r,this;let l=1-o*o;if(l<=Number.EPSILON){let f=1-e;return this._w=f*a+e*this._w,this._x=f*n+e*this._x,this._y=f*s+e*this._y,this._z=f*r+e*this._z,this.normalize(),this}let c=Math.sqrt(l),u=Math.atan2(c,o),d=Math.sin((1-e)*u)/c,h=Math.sin(e*u)/c;return this._w=a*d+this._w*h,this._x=n*d+this._x*h,this._y=s*d+this._y*h,this._z=r*d+this._z*h,this._onChangeCallback(),this}slerpQuaternions(t,e,n){return this.copy(t).slerp(e,n)}random(){let t=2*Math.PI*Math.random(),e=2*Math.PI*Math.random(),n=Math.random(),s=Math.sqrt(1-n),r=Math.sqrt(n);return this.set(s*Math.sin(t),s*Math.cos(t),r*Math.sin(e),r*Math.cos(e))}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._w===this._w}fromArray(t,e=0){return this._x=t[e],this._y=t[e+1],this._z=t[e+2],this._w=t[e+3],this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._w,t}fromBufferAttribute(t,e){return this._x=t.getX(e),this._y=t.getY(e),this._z=t.getZ(e),this._w=t.getW(e),this._onChangeCallback(),this}toJSON(){return this.toArray()}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._w}},L=class i{constructor(t=0,e=0,n=0){i.prototype.isVector3=!0,this.x=t,this.y=e,this.z=n}set(t,e,n){return n===void 0&&(n=this.z),this.x=t,this.y=e,this.z=n,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this}multiplyVectors(t,e){return this.x=t.x*e.x,this.y=t.y*e.y,this.z=t.z*e.z,this}applyEuler(t){return this.applyQuaternion(Dc.setFromEuler(t))}applyAxisAngle(t,e){return this.applyQuaternion(Dc.setFromAxisAngle(t,e))}applyMatrix3(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[3]*n+r[6]*s,this.y=r[1]*e+r[4]*n+r[7]*s,this.z=r[2]*e+r[5]*n+r[8]*s,this}applyNormalMatrix(t){return this.applyMatrix3(t).normalize()}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=t.elements,a=1/(r[3]*e+r[7]*n+r[11]*s+r[15]);return this.x=(r[0]*e+r[4]*n+r[8]*s+r[12])*a,this.y=(r[1]*e+r[5]*n+r[9]*s+r[13])*a,this.z=(r[2]*e+r[6]*n+r[10]*s+r[14])*a,this}applyQuaternion(t){let e=this.x,n=this.y,s=this.z,r=t.x,a=t.y,o=t.z,l=t.w,c=2*(a*s-o*n),u=2*(o*e-r*s),d=2*(r*n-a*e);return this.x=e+l*c+a*d-o*u,this.y=n+l*u+o*c-r*d,this.z=s+l*d+r*u-a*c,this}project(t){return this.applyMatrix4(t.matrixWorldInverse).applyMatrix4(t.projectionMatrix)}unproject(t){return this.applyMatrix4(t.projectionMatrixInverse).applyMatrix4(t.matrixWorld)}transformDirection(t){let e=this.x,n=this.y,s=this.z,r=t.elements;return this.x=r[0]*e+r[4]*n+r[8]*s,this.y=r[1]*e+r[5]*n+r[9]*s,this.z=r[2]*e+r[6]*n+r[10]*s,this.normalize()}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this}divideScalar(t){return this.multiplyScalar(1/t)}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this}clamp(t,e){return this.x=Ht(this.x,t.x,e.x),this.y=Ht(this.y,t.y,e.y),this.z=Ht(this.z,t.z,e.z),this}clampScalar(t,e){return this.x=Ht(this.x,t,e),this.y=Ht(this.y,t,e),this.z=Ht(this.z,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ht(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this}cross(t){return this.crossVectors(this,t)}crossVectors(t,e){let n=t.x,s=t.y,r=t.z,a=e.x,o=e.y,l=e.z;return this.x=s*l-r*o,this.y=r*a-n*l,this.z=n*o-s*a,this}projectOnVector(t){let e=t.lengthSq();if(e===0)return this.set(0,0,0);let n=t.dot(this)/e;return this.copy(t).multiplyScalar(n)}projectOnPlane(t){return Oo.copy(this).projectOnVector(t),this.sub(Oo)}reflect(t){return this.sub(Oo.copy(t).multiplyScalar(2*this.dot(t)))}angleTo(t){let e=Math.sqrt(this.lengthSq()*t.lengthSq());if(e===0)return Math.PI/2;let n=this.dot(t)/e;return Math.acos(Ht(n,-1,1))}distanceTo(t){return Math.sqrt(this.distanceToSquared(t))}distanceToSquared(t){let e=this.x-t.x,n=this.y-t.y,s=this.z-t.z;return e*e+n*n+s*s}manhattanDistanceTo(t){return Math.abs(this.x-t.x)+Math.abs(this.y-t.y)+Math.abs(this.z-t.z)}setFromSpherical(t){return this.setFromSphericalCoords(t.radius,t.phi,t.theta)}setFromSphericalCoords(t,e,n){let s=Math.sin(e)*t;return this.x=s*Math.sin(n),this.y=Math.cos(e)*t,this.z=s*Math.cos(n),this}setFromCylindrical(t){return this.setFromCylindricalCoords(t.radius,t.theta,t.y)}setFromCylindricalCoords(t,e,n){return this.x=t*Math.sin(e),this.y=n,this.z=t*Math.cos(e),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this}setFromMatrixScale(t){let e=this.setFromMatrixColumn(t,0).length(),n=this.setFromMatrixColumn(t,1).length(),s=this.setFromMatrixColumn(t,2).length();return this.x=e,this.y=n,this.z=s,this}setFromMatrixColumn(t,e){return this.fromArray(t.elements,e*4)}setFromMatrix3Column(t,e){return this.fromArray(t.elements,e*3)}setFromEuler(t){return this.x=t._x,this.y=t._y,this.z=t._z,this}setFromColor(t){return this.x=t.r,this.y=t.g,this.z=t.b,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this}randomDirection(){let t=Math.random()*Math.PI*2,e=Math.random()*2-1,n=Math.sqrt(1-e*e);return this.x=n*Math.cos(t),this.y=e,this.z=n*Math.sin(t),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z}},Oo=new L,Dc=new Ue,Ot=class i{constructor(t,e,n,s,r,a,o,l,c){i.prototype.isMatrix3=!0,this.elements=[1,0,0,0,1,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c)}set(t,e,n,s,r,a,o,l,c){let u=this.elements;return u[0]=t,u[1]=s,u[2]=o,u[3]=e,u[4]=r,u[5]=l,u[6]=n,u[7]=a,u[8]=c,this}identity(){return this.set(1,0,0,0,1,0,0,0,1),this}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],this}extractBasis(t,e,n){return t.setFromMatrix3Column(this,0),e.setFromMatrix3Column(this,1),n.setFromMatrix3Column(this,2),this}setFromMatrix4(t){let e=t.elements;return this.set(e[0],e[4],e[8],e[1],e[5],e[9],e[2],e[6],e[10]),this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[3],l=n[6],c=n[1],u=n[4],d=n[7],h=n[2],f=n[5],_=n[8],y=s[0],m=s[3],p=s[6],w=s[1],E=s[4],M=s[7],P=s[2],R=s[5],C=s[8];return r[0]=a*y+o*w+l*P,r[3]=a*m+o*E+l*R,r[6]=a*p+o*M+l*C,r[1]=c*y+u*w+d*P,r[4]=c*m+u*E+d*R,r[7]=c*p+u*M+d*C,r[2]=h*y+f*w+_*P,r[5]=h*m+f*E+_*R,r[8]=h*p+f*M+_*C,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[3]*=t,e[6]*=t,e[1]*=t,e[4]*=t,e[7]*=t,e[2]*=t,e[5]*=t,e[8]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8];return e*a*u-e*o*c-n*r*u+n*o*l+s*r*c-s*a*l}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],d=u*a-o*c,h=o*l-u*r,f=c*r-a*l,_=e*d+n*h+s*f;if(_===0)return this.set(0,0,0,0,0,0,0,0,0);let y=1/_;return t[0]=d*y,t[1]=(s*c-u*n)*y,t[2]=(o*n-s*a)*y,t[3]=h*y,t[4]=(u*e-s*l)*y,t[5]=(s*r-o*e)*y,t[6]=f*y,t[7]=(n*l-c*e)*y,t[8]=(a*e-n*r)*y,this}transpose(){let t,e=this.elements;return t=e[1],e[1]=e[3],e[3]=t,t=e[2],e[2]=e[6],e[6]=t,t=e[5],e[5]=e[7],e[7]=t,this}getNormalMatrix(t){return this.setFromMatrix4(t).invert().transpose()}transposeIntoArray(t){let e=this.elements;return t[0]=e[0],t[1]=e[3],t[2]=e[6],t[3]=e[1],t[4]=e[4],t[5]=e[7],t[6]=e[2],t[7]=e[5],t[8]=e[8],this}setUvTransform(t,e,n,s,r,a,o){let l=Math.cos(r),c=Math.sin(r);return this.set(n*l,n*c,-n*(l*a+c*o)+a+t,-s*c,s*l,-s*(-c*a+l*o)+o+e,0,0,1),this}scale(t,e){return this.premultiply(Bo.makeScale(t,e)),this}rotate(t){return this.premultiply(Bo.makeRotation(-t)),this}translate(t,e){return this.premultiply(Bo.makeTranslation(t,e)),this}makeTranslation(t,e){return t.isVector2?this.set(1,0,t.x,0,1,t.y,0,0,1):this.set(1,0,t,0,1,e,0,0,1),this}makeRotation(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,n,e,0,0,0,1),this}makeScale(t,e){return this.set(t,0,0,0,e,0,0,0,1),this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<9;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<9;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t}clone(){return new this.constructor().fromArray(this.elements)}},Bo=new Ot;function Nl(i){for(let t=i.length-1;t>=0;--t)if(i[t]>=65535)return!0;return!1}function Bs(i){return document.createElementNS("http://www.w3.org/1999/xhtml",i)}function Xh(){let i=Bs("canvas");return i.style.display="block",i}var Nc={};function ns(i){i in Nc||(Nc[i]=!0,console.warn(i))}function $h(i,t,e){return new Promise(function(n,s){function r(){switch(i.clientWaitSync(t,i.SYNC_FLUSH_COMMANDS_BIT,0)){case i.WAIT_FAILED:s();break;case i.TIMEOUT_EXPIRED:setTimeout(r,e);break;default:n()}}setTimeout(r,e)})}var Uc=new Ot().set(.4123908,.3575843,.1804808,.212639,.7151687,.0721923,.0193308,.1191948,.9505322),Fc=new Ot().set(3.2409699,-1.5373832,-.4986108,-.9692436,1.8759675,.0415551,.0556301,-.203977,1.0569715);function yu(){let i={enabled:!0,workingColorSpace:Mi,spaces:{},convert:function(s,r,a){return this.enabled===!1||r===a||!r||!a||(this.spaces[r].transfer===Kt&&(s.r=On(s.r),s.g=On(s.g),s.b=On(s.b)),this.spaces[r].primaries!==this.spaces[a].primaries&&(s.applyMatrix3(this.spaces[r].toXYZ),s.applyMatrix3(this.spaces[a].fromXYZ)),this.spaces[a].transfer===Kt&&(s.r=Qi(s.r),s.g=Qi(s.g),s.b=Qi(s.b))),s},workingToColorSpace:function(s,r){return this.convert(s,this.workingColorSpace,r)},colorSpaceToWorking:function(s,r){return this.convert(s,r,this.workingColorSpace)},getPrimaries:function(s){return this.spaces[s].primaries},getTransfer:function(s){return s===Gn?Fs:this.spaces[s].transfer},getToneMappingMode:function(s){return this.spaces[s].outputColorSpaceConfig.toneMappingMode||"standard"},getLuminanceCoefficients:function(s,r=this.workingColorSpace){return s.fromArray(this.spaces[r].luminanceCoefficients)},define:function(s){Object.assign(this.spaces,s)},_getMatrix:function(s,r,a){return s.copy(this.spaces[r].toXYZ).multiply(this.spaces[a].fromXYZ)},_getDrawingBufferColorSpace:function(s){return this.spaces[s].outputColorSpaceConfig.drawingBufferColorSpace},_getUnpackColorSpace:function(s=this.workingColorSpace){return this.spaces[s].workingColorSpaceConfig.unpackColorSpace},fromWorkingColorSpace:function(s,r){return ns("THREE.ColorManagement: .fromWorkingColorSpace() has been renamed to .workingToColorSpace()."),i.workingToColorSpace(s,r)},toWorkingColorSpace:function(s,r){return ns("THREE.ColorManagement: .toWorkingColorSpace() has been renamed to .colorSpaceToWorking()."),i.colorSpaceToWorking(s,r)}},t=[.64,.33,.3,.6,.15,.06],e=[.2126,.7152,.0722],n=[.3127,.329];return i.define({[Mi]:{primaries:t,whitePoint:n,transfer:Fs,toXYZ:Uc,fromXYZ:Fc,luminanceCoefficients:e,workingColorSpaceConfig:{unpackColorSpace:ze},outputColorSpaceConfig:{drawingBufferColorSpace:ze}},[ze]:{primaries:t,whitePoint:n,transfer:Kt,toXYZ:Uc,fromXYZ:Fc,luminanceCoefficients:e,outputColorSpaceConfig:{drawingBufferColorSpace:ze}}}),i}var $t=yu();function On(i){return i<.04045?i*.0773993808:Math.pow(i*.9478672986+.0521327014,2.4)}function Qi(i){return i<.0031308?i*12.92:1.055*Math.pow(i,.41666)-.055}var zi,Zr=class{static getDataURL(t,e="image/png"){if(/^data:/i.test(t.src)||typeof HTMLCanvasElement>"u")return t.src;let n;if(t instanceof HTMLCanvasElement)n=t;else{zi===void 0&&(zi=Bs("canvas")),zi.width=t.width,zi.height=t.height;let s=zi.getContext("2d");t instanceof ImageData?s.putImageData(t,0,0):s.drawImage(t,0,0,t.width,t.height),n=zi}return n.toDataURL(e)}static sRGBToLinear(t){if(typeof HTMLImageElement<"u"&&t instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&t instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&t instanceof ImageBitmap){let e=Bs("canvas");e.width=t.width,e.height=t.height;let n=e.getContext("2d");n.drawImage(t,0,0,t.width,t.height);let s=n.getImageData(0,0,t.width,t.height),r=s.data;for(let a=0;a<r.length;a++)r[a]=On(r[a]/255)*255;return n.putImageData(s,0,0),e}else if(t.data){let e=t.data.slice(0);for(let n=0;n<e.length;n++)e instanceof Uint8Array||e instanceof Uint8ClampedArray?e[n]=Math.floor(On(e[n]/255)*255):e[n]=On(e[n]);return{data:e,width:t.width,height:t.height}}else return console.warn("THREE.ImageUtils.sRGBToLinear(): Unsupported image type. No color space conversion applied."),t}},vu=0,is=class{constructor(t=null){this.isSource=!0,Object.defineProperty(this,"id",{value:vu++}),this.uuid=ps(),this.data=t,this.dataReady=!0,this.version=0}getSize(t){let e=this.data;return typeof HTMLVideoElement<"u"&&e instanceof HTMLVideoElement?t.set(e.videoWidth,e.videoHeight,0):e instanceof VideoFrame?t.set(e.displayHeight,e.displayWidth,0):e!==null?t.set(e.width,e.height,e.depth||0):t.set(0,0,0),t}set needsUpdate(t){t===!0&&this.version++}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.images[this.uuid]!==void 0)return t.images[this.uuid];let n={uuid:this.uuid,url:""},s=this.data;if(s!==null){let r;if(Array.isArray(s)){r=[];for(let a=0,o=s.length;a<o;a++)s[a].isDataTexture?r.push(zo(s[a].image)):r.push(zo(s[a]))}else r=zo(s);n.url=r}return e||(t.images[this.uuid]=n),n}};function zo(i){return typeof HTMLImageElement<"u"&&i instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&i instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&i instanceof ImageBitmap?Zr.getDataURL(i):i.data?{data:Array.from(i.data),width:i.width,height:i.height,type:i.data.constructor.name}:(console.warn("THREE.Texture: Unable to serialize Texture."),{})}var bu=0,ko=new L,Xe=class i extends wn{constructor(t=i.DEFAULT_IMAGE,e=i.DEFAULT_MAPPING,n=ei,s=ei,r=mn,a=ci,o=on,l=xn,c=i.DEFAULT_ANISOTROPY,u=Gn){super(),this.isTexture=!0,Object.defineProperty(this,"id",{value:bu++}),this.uuid=ps(),this.name="",this.source=new is(t),this.mipmaps=[],this.mapping=e,this.channel=0,this.wrapS=n,this.wrapT=s,this.magFilter=r,this.minFilter=a,this.anisotropy=c,this.format=o,this.internalFormat=null,this.type=l,this.offset=new Dt(0,0),this.repeat=new Dt(1,1),this.center=new Dt(0,0),this.rotation=0,this.matrixAutoUpdate=!0,this.matrix=new Ot,this.generateMipmaps=!0,this.premultiplyAlpha=!1,this.flipY=!0,this.unpackAlignment=4,this.colorSpace=u,this.userData={},this.updateRanges=[],this.version=0,this.onUpdate=null,this.renderTarget=null,this.isRenderTargetTexture=!1,this.isArrayTexture=!!(t&&t.depth&&t.depth>1),this.pmremVersion=0}get width(){return this.source.getSize(ko).x}get height(){return this.source.getSize(ko).y}get depth(){return this.source.getSize(ko).z}get image(){return this.source.data}set image(t=null){this.source.data=t}updateMatrix(){this.matrix.setUvTransform(this.offset.x,this.offset.y,this.repeat.x,this.repeat.y,this.rotation,this.center.x,this.center.y)}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}clone(){return new this.constructor().copy(this)}copy(t){return this.name=t.name,this.source=t.source,this.mipmaps=t.mipmaps.slice(0),this.mapping=t.mapping,this.channel=t.channel,this.wrapS=t.wrapS,this.wrapT=t.wrapT,this.magFilter=t.magFilter,this.minFilter=t.minFilter,this.anisotropy=t.anisotropy,this.format=t.format,this.internalFormat=t.internalFormat,this.type=t.type,this.offset.copy(t.offset),this.repeat.copy(t.repeat),this.center.copy(t.center),this.rotation=t.rotation,this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrix.copy(t.matrix),this.generateMipmaps=t.generateMipmaps,this.premultiplyAlpha=t.premultiplyAlpha,this.flipY=t.flipY,this.unpackAlignment=t.unpackAlignment,this.colorSpace=t.colorSpace,this.renderTarget=t.renderTarget,this.isRenderTargetTexture=t.isRenderTargetTexture,this.isArrayTexture=t.isArrayTexture,this.userData=JSON.parse(JSON.stringify(t.userData)),this.needsUpdate=!0,this}setValues(t){for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Texture.setValues(): parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Texture.setValues(): property '${e}' does not exist.`);continue}s&&n&&s.isVector2&&n.isVector2||s&&n&&s.isVector3&&n.isVector3||s&&n&&s.isMatrix3&&n.isMatrix3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";if(!e&&t.textures[this.uuid]!==void 0)return t.textures[this.uuid];let n={metadata:{version:4.7,type:"Texture",generator:"Texture.toJSON"},uuid:this.uuid,name:this.name,image:this.source.toJSON(t).uuid,mapping:this.mapping,channel:this.channel,repeat:[this.repeat.x,this.repeat.y],offset:[this.offset.x,this.offset.y],center:[this.center.x,this.center.y],rotation:this.rotation,wrap:[this.wrapS,this.wrapT],format:this.format,internalFormat:this.internalFormat,type:this.type,colorSpace:this.colorSpace,minFilter:this.minFilter,magFilter:this.magFilter,anisotropy:this.anisotropy,flipY:this.flipY,generateMipmaps:this.generateMipmaps,premultiplyAlpha:this.premultiplyAlpha,unpackAlignment:this.unpackAlignment};return Object.keys(this.userData).length>0&&(n.userData=this.userData),e||(t.textures[this.uuid]=n),n}dispose(){this.dispatchEvent({type:"dispose"})}transformUv(t){if(this.mapping!==bl)return t;if(t.applyMatrix3(this.matrix),t.x<0||t.x>1)switch(this.wrapS){case $r:t.x=t.x-Math.floor(t.x);break;case ei:t.x=t.x<0?0:1;break;case qr:Math.abs(Math.floor(t.x)%2)===1?t.x=Math.ceil(t.x)-t.x:t.x=t.x-Math.floor(t.x);break}if(t.y<0||t.y>1)switch(this.wrapT){case $r:t.y=t.y-Math.floor(t.y);break;case ei:t.y=t.y<0?0:1;break;case qr:Math.abs(Math.floor(t.y)%2)===1?t.y=Math.ceil(t.y)-t.y:t.y=t.y-Math.floor(t.y);break}return this.flipY&&(t.y=1-t.y),t}set needsUpdate(t){t===!0&&(this.version++,this.source.needsUpdate=!0)}set needsPMREMUpdate(t){t===!0&&this.pmremVersion++}};Xe.DEFAULT_IMAGE=null;Xe.DEFAULT_MAPPING=bl;Xe.DEFAULT_ANISOTROPY=1;var de=class i{constructor(t=0,e=0,n=0,s=1){i.prototype.isVector4=!0,this.x=t,this.y=e,this.z=n,this.w=s}get width(){return this.z}set width(t){this.z=t}get height(){return this.w}set height(t){this.w=t}set(t,e,n,s){return this.x=t,this.y=e,this.z=n,this.w=s,this}setScalar(t){return this.x=t,this.y=t,this.z=t,this.w=t,this}setX(t){return this.x=t,this}setY(t){return this.y=t,this}setZ(t){return this.z=t,this}setW(t){return this.w=t,this}setComponent(t,e){switch(t){case 0:this.x=e;break;case 1:this.y=e;break;case 2:this.z=e;break;case 3:this.w=e;break;default:throw new Error("index is out of range: "+t)}return this}getComponent(t){switch(t){case 0:return this.x;case 1:return this.y;case 2:return this.z;case 3:return this.w;default:throw new Error("index is out of range: "+t)}}clone(){return new this.constructor(this.x,this.y,this.z,this.w)}copy(t){return this.x=t.x,this.y=t.y,this.z=t.z,this.w=t.w!==void 0?t.w:1,this}add(t){return this.x+=t.x,this.y+=t.y,this.z+=t.z,this.w+=t.w,this}addScalar(t){return this.x+=t,this.y+=t,this.z+=t,this.w+=t,this}addVectors(t,e){return this.x=t.x+e.x,this.y=t.y+e.y,this.z=t.z+e.z,this.w=t.w+e.w,this}addScaledVector(t,e){return this.x+=t.x*e,this.y+=t.y*e,this.z+=t.z*e,this.w+=t.w*e,this}sub(t){return this.x-=t.x,this.y-=t.y,this.z-=t.z,this.w-=t.w,this}subScalar(t){return this.x-=t,this.y-=t,this.z-=t,this.w-=t,this}subVectors(t,e){return this.x=t.x-e.x,this.y=t.y-e.y,this.z=t.z-e.z,this.w=t.w-e.w,this}multiply(t){return this.x*=t.x,this.y*=t.y,this.z*=t.z,this.w*=t.w,this}multiplyScalar(t){return this.x*=t,this.y*=t,this.z*=t,this.w*=t,this}applyMatrix4(t){let e=this.x,n=this.y,s=this.z,r=this.w,a=t.elements;return this.x=a[0]*e+a[4]*n+a[8]*s+a[12]*r,this.y=a[1]*e+a[5]*n+a[9]*s+a[13]*r,this.z=a[2]*e+a[6]*n+a[10]*s+a[14]*r,this.w=a[3]*e+a[7]*n+a[11]*s+a[15]*r,this}divide(t){return this.x/=t.x,this.y/=t.y,this.z/=t.z,this.w/=t.w,this}divideScalar(t){return this.multiplyScalar(1/t)}setAxisAngleFromQuaternion(t){this.w=2*Math.acos(t.w);let e=Math.sqrt(1-t.w*t.w);return e<1e-4?(this.x=1,this.y=0,this.z=0):(this.x=t.x/e,this.y=t.y/e,this.z=t.z/e),this}setAxisAngleFromRotationMatrix(t){let e,n,s,r,l=t.elements,c=l[0],u=l[4],d=l[8],h=l[1],f=l[5],_=l[9],y=l[2],m=l[6],p=l[10];if(Math.abs(u-h)<.01&&Math.abs(d-y)<.01&&Math.abs(_-m)<.01){if(Math.abs(u+h)<.1&&Math.abs(d+y)<.1&&Math.abs(_+m)<.1&&Math.abs(c+f+p-3)<.1)return this.set(1,0,0,0),this;e=Math.PI;let E=(c+1)/2,M=(f+1)/2,P=(p+1)/2,R=(u+h)/4,C=(d+y)/4,B=(_+m)/4;return E>M&&E>P?E<.01?(n=0,s=.707106781,r=.707106781):(n=Math.sqrt(E),s=R/n,r=C/n):M>P?M<.01?(n=.707106781,s=0,r=.707106781):(s=Math.sqrt(M),n=R/s,r=B/s):P<.01?(n=.707106781,s=.707106781,r=0):(r=Math.sqrt(P),n=C/r,s=B/r),this.set(n,s,r,e),this}let w=Math.sqrt((m-_)*(m-_)+(d-y)*(d-y)+(h-u)*(h-u));return Math.abs(w)<.001&&(w=1),this.x=(m-_)/w,this.y=(d-y)/w,this.z=(h-u)/w,this.w=Math.acos((c+f+p-1)/2),this}setFromMatrixPosition(t){let e=t.elements;return this.x=e[12],this.y=e[13],this.z=e[14],this.w=e[15],this}min(t){return this.x=Math.min(this.x,t.x),this.y=Math.min(this.y,t.y),this.z=Math.min(this.z,t.z),this.w=Math.min(this.w,t.w),this}max(t){return this.x=Math.max(this.x,t.x),this.y=Math.max(this.y,t.y),this.z=Math.max(this.z,t.z),this.w=Math.max(this.w,t.w),this}clamp(t,e){return this.x=Ht(this.x,t.x,e.x),this.y=Ht(this.y,t.y,e.y),this.z=Ht(this.z,t.z,e.z),this.w=Ht(this.w,t.w,e.w),this}clampScalar(t,e){return this.x=Ht(this.x,t,e),this.y=Ht(this.y,t,e),this.z=Ht(this.z,t,e),this.w=Ht(this.w,t,e),this}clampLength(t,e){let n=this.length();return this.divideScalar(n||1).multiplyScalar(Ht(n,t,e))}floor(){return this.x=Math.floor(this.x),this.y=Math.floor(this.y),this.z=Math.floor(this.z),this.w=Math.floor(this.w),this}ceil(){return this.x=Math.ceil(this.x),this.y=Math.ceil(this.y),this.z=Math.ceil(this.z),this.w=Math.ceil(this.w),this}round(){return this.x=Math.round(this.x),this.y=Math.round(this.y),this.z=Math.round(this.z),this.w=Math.round(this.w),this}roundToZero(){return this.x=Math.trunc(this.x),this.y=Math.trunc(this.y),this.z=Math.trunc(this.z),this.w=Math.trunc(this.w),this}negate(){return this.x=-this.x,this.y=-this.y,this.z=-this.z,this.w=-this.w,this}dot(t){return this.x*t.x+this.y*t.y+this.z*t.z+this.w*t.w}lengthSq(){return this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w}length(){return Math.sqrt(this.x*this.x+this.y*this.y+this.z*this.z+this.w*this.w)}manhattanLength(){return Math.abs(this.x)+Math.abs(this.y)+Math.abs(this.z)+Math.abs(this.w)}normalize(){return this.divideScalar(this.length()||1)}setLength(t){return this.normalize().multiplyScalar(t)}lerp(t,e){return this.x+=(t.x-this.x)*e,this.y+=(t.y-this.y)*e,this.z+=(t.z-this.z)*e,this.w+=(t.w-this.w)*e,this}lerpVectors(t,e,n){return this.x=t.x+(e.x-t.x)*n,this.y=t.y+(e.y-t.y)*n,this.z=t.z+(e.z-t.z)*n,this.w=t.w+(e.w-t.w)*n,this}equals(t){return t.x===this.x&&t.y===this.y&&t.z===this.z&&t.w===this.w}fromArray(t,e=0){return this.x=t[e],this.y=t[e+1],this.z=t[e+2],this.w=t[e+3],this}toArray(t=[],e=0){return t[e]=this.x,t[e+1]=this.y,t[e+2]=this.z,t[e+3]=this.w,t}fromBufferAttribute(t,e){return this.x=t.getX(e),this.y=t.getY(e),this.z=t.getZ(e),this.w=t.getW(e),this}random(){return this.x=Math.random(),this.y=Math.random(),this.z=Math.random(),this.w=Math.random(),this}*[Symbol.iterator](){yield this.x,yield this.y,yield this.z,yield this.w}},Jr=class extends wn{constructor(t=1,e=1,n={}){super(),n=Object.assign({generateMipmaps:!1,internalFormat:null,minFilter:mn,depthBuffer:!0,stencilBuffer:!1,resolveDepthBuffer:!0,resolveStencilBuffer:!0,depthTexture:null,samples:0,count:1,depth:1,multiview:!1},n),this.isRenderTarget=!0,this.width=t,this.height=e,this.depth=n.depth,this.scissor=new de(0,0,t,e),this.scissorTest=!1,this.viewport=new de(0,0,t,e);let s={width:t,height:e,depth:n.depth},r=new Xe(s);this.textures=[];let a=n.count;for(let o=0;o<a;o++)this.textures[o]=r.clone(),this.textures[o].isRenderTargetTexture=!0,this.textures[o].renderTarget=this;this._setTextureOptions(n),this.depthBuffer=n.depthBuffer,this.stencilBuffer=n.stencilBuffer,this.resolveDepthBuffer=n.resolveDepthBuffer,this.resolveStencilBuffer=n.resolveStencilBuffer,this._depthTexture=null,this.depthTexture=n.depthTexture,this.samples=n.samples,this.multiview=n.multiview}_setTextureOptions(t={}){let e={minFilter:mn,generateMipmaps:!1,flipY:!1,internalFormat:null};t.mapping!==void 0&&(e.mapping=t.mapping),t.wrapS!==void 0&&(e.wrapS=t.wrapS),t.wrapT!==void 0&&(e.wrapT=t.wrapT),t.wrapR!==void 0&&(e.wrapR=t.wrapR),t.magFilter!==void 0&&(e.magFilter=t.magFilter),t.minFilter!==void 0&&(e.minFilter=t.minFilter),t.format!==void 0&&(e.format=t.format),t.type!==void 0&&(e.type=t.type),t.anisotropy!==void 0&&(e.anisotropy=t.anisotropy),t.colorSpace!==void 0&&(e.colorSpace=t.colorSpace),t.flipY!==void 0&&(e.flipY=t.flipY),t.generateMipmaps!==void 0&&(e.generateMipmaps=t.generateMipmaps),t.internalFormat!==void 0&&(e.internalFormat=t.internalFormat);for(let n=0;n<this.textures.length;n++)this.textures[n].setValues(e)}get texture(){return this.textures[0]}set texture(t){this.textures[0]=t}set depthTexture(t){this._depthTexture!==null&&(this._depthTexture.renderTarget=null),t!==null&&(t.renderTarget=this),this._depthTexture=t}get depthTexture(){return this._depthTexture}setSize(t,e,n=1){if(this.width!==t||this.height!==e||this.depth!==n){this.width=t,this.height=e,this.depth=n;for(let s=0,r=this.textures.length;s<r;s++)this.textures[s].image.width=t,this.textures[s].image.height=e,this.textures[s].image.depth=n,this.textures[s].isArrayTexture=this.textures[s].image.depth>1;this.dispose()}this.viewport.set(0,0,t,e),this.scissor.set(0,0,t,e)}clone(){return new this.constructor().copy(this)}copy(t){this.width=t.width,this.height=t.height,this.depth=t.depth,this.scissor.copy(t.scissor),this.scissorTest=t.scissorTest,this.viewport.copy(t.viewport),this.textures.length=0;for(let e=0,n=t.textures.length;e<n;e++){this.textures[e]=t.textures[e].clone(),this.textures[e].isRenderTargetTexture=!0,this.textures[e].renderTarget=this;let s=Object.assign({},t.textures[e].image);this.textures[e].source=new is(s)}return this.depthBuffer=t.depthBuffer,this.stencilBuffer=t.stencilBuffer,this.resolveDepthBuffer=t.resolveDepthBuffer,this.resolveStencilBuffer=t.resolveStencilBuffer,t.depthTexture!==null&&(this.depthTexture=t.depthTexture.clone()),this.samples=t.samples,this}dispose(){this.dispatchEvent({type:"dispose"})}},En=class extends Jr{constructor(t=1,e=1,n={}){super(t,e,n),this.isWebGLRenderTarget=!0}},zs=class extends Xe{constructor(t=null,e=1,n=1,s=1){super(null),this.isDataArrayTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=We,this.minFilter=We,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1,this.layerUpdates=new Set}addLayerUpdate(t){this.layerUpdates.add(t)}clearLayerUpdates(){this.layerUpdates.clear()}};var Kr=class extends Xe{constructor(t=null,e=1,n=1,s=1){super(null),this.isData3DTexture=!0,this.image={data:t,width:e,height:n,depth:s},this.magFilter=We,this.minFilter=We,this.wrapR=ei,this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var tn=class{constructor(t=new L(1/0,1/0,1/0),e=new L(-1/0,-1/0,-1/0)){this.isBox3=!0,this.min=t,this.max=e}set(t,e){return this.min.copy(t),this.max.copy(e),this}setFromArray(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e+=3)this.expandByPoint(dn.fromArray(t,e));return this}setFromBufferAttribute(t){this.makeEmpty();for(let e=0,n=t.count;e<n;e++)this.expandByPoint(dn.fromBufferAttribute(t,e));return this}setFromPoints(t){this.makeEmpty();for(let e=0,n=t.length;e<n;e++)this.expandByPoint(t[e]);return this}setFromCenterAndSize(t,e){let n=dn.copy(e).multiplyScalar(.5);return this.min.copy(t).sub(n),this.max.copy(t).add(n),this}setFromObject(t,e=!1){return this.makeEmpty(),this.expandByObject(t,e)}clone(){return new this.constructor().copy(this)}copy(t){return this.min.copy(t.min),this.max.copy(t.max),this}makeEmpty(){return this.min.x=this.min.y=this.min.z=1/0,this.max.x=this.max.y=this.max.z=-1/0,this}isEmpty(){return this.max.x<this.min.x||this.max.y<this.min.y||this.max.z<this.min.z}getCenter(t){return this.isEmpty()?t.set(0,0,0):t.addVectors(this.min,this.max).multiplyScalar(.5)}getSize(t){return this.isEmpty()?t.set(0,0,0):t.subVectors(this.max,this.min)}expandByPoint(t){return this.min.min(t),this.max.max(t),this}expandByVector(t){return this.min.sub(t),this.max.add(t),this}expandByScalar(t){return this.min.addScalar(-t),this.max.addScalar(t),this}expandByObject(t,e=!1){t.updateWorldMatrix(!1,!1);let n=t.geometry;if(n!==void 0){let r=n.getAttribute("position");if(e===!0&&r!==void 0&&t.isInstancedMesh!==!0)for(let a=0,o=r.count;a<o;a++)t.isMesh===!0?t.getVertexPosition(a,dn):dn.fromBufferAttribute(r,a),dn.applyMatrix4(t.matrixWorld),this.expandByPoint(dn);else t.boundingBox!==void 0?(t.boundingBox===null&&t.computeBoundingBox(),Mr.copy(t.boundingBox)):(n.boundingBox===null&&n.computeBoundingBox(),Mr.copy(n.boundingBox)),Mr.applyMatrix4(t.matrixWorld),this.union(Mr)}let s=t.children;for(let r=0,a=s.length;r<a;r++)this.expandByObject(s[r],e);return this}containsPoint(t){return t.x>=this.min.x&&t.x<=this.max.x&&t.y>=this.min.y&&t.y<=this.max.y&&t.z>=this.min.z&&t.z<=this.max.z}containsBox(t){return this.min.x<=t.min.x&&t.max.x<=this.max.x&&this.min.y<=t.min.y&&t.max.y<=this.max.y&&this.min.z<=t.min.z&&t.max.z<=this.max.z}getParameter(t,e){return e.set((t.x-this.min.x)/(this.max.x-this.min.x),(t.y-this.min.y)/(this.max.y-this.min.y),(t.z-this.min.z)/(this.max.z-this.min.z))}intersectsBox(t){return t.max.x>=this.min.x&&t.min.x<=this.max.x&&t.max.y>=this.min.y&&t.min.y<=this.max.y&&t.max.z>=this.min.z&&t.min.z<=this.max.z}intersectsSphere(t){return this.clampPoint(t.center,dn),dn.distanceToSquared(t.center)<=t.radius*t.radius}intersectsPlane(t){let e,n;return t.normal.x>0?(e=t.normal.x*this.min.x,n=t.normal.x*this.max.x):(e=t.normal.x*this.max.x,n=t.normal.x*this.min.x),t.normal.y>0?(e+=t.normal.y*this.min.y,n+=t.normal.y*this.max.y):(e+=t.normal.y*this.max.y,n+=t.normal.y*this.min.y),t.normal.z>0?(e+=t.normal.z*this.min.z,n+=t.normal.z*this.max.z):(e+=t.normal.z*this.max.z,n+=t.normal.z*this.min.z),e<=-t.constant&&n>=-t.constant}intersectsTriangle(t){if(this.isEmpty())return!1;this.getCenter(Ts),Sr.subVectors(this.max,Ts),ki.subVectors(t.a,Ts),Vi.subVectors(t.b,Ts),Hi.subVectors(t.c,Ts),Yn.subVectors(Vi,ki),Zn.subVectors(Hi,Vi),mi.subVectors(ki,Hi);let e=[0,-Yn.z,Yn.y,0,-Zn.z,Zn.y,0,-mi.z,mi.y,Yn.z,0,-Yn.x,Zn.z,0,-Zn.x,mi.z,0,-mi.x,-Yn.y,Yn.x,0,-Zn.y,Zn.x,0,-mi.y,mi.x,0];return!Vo(e,ki,Vi,Hi,Sr)||(e=[1,0,0,0,1,0,0,0,1],!Vo(e,ki,Vi,Hi,Sr))?!1:(wr.crossVectors(Yn,Zn),e=[wr.x,wr.y,wr.z],Vo(e,ki,Vi,Hi,Sr))}clampPoint(t,e){return e.copy(t).clamp(this.min,this.max)}distanceToPoint(t){return this.clampPoint(t,dn).distanceTo(t)}getBoundingSphere(t){return this.isEmpty()?t.makeEmpty():(this.getCenter(t.center),t.radius=this.getSize(dn).length()*.5),t}intersect(t){return this.min.max(t.min),this.max.min(t.max),this.isEmpty()&&this.makeEmpty(),this}union(t){return this.min.min(t.min),this.max.max(t.max),this}applyMatrix4(t){return this.isEmpty()?this:(In[0].set(this.min.x,this.min.y,this.min.z).applyMatrix4(t),In[1].set(this.min.x,this.min.y,this.max.z).applyMatrix4(t),In[2].set(this.min.x,this.max.y,this.min.z).applyMatrix4(t),In[3].set(this.min.x,this.max.y,this.max.z).applyMatrix4(t),In[4].set(this.max.x,this.min.y,this.min.z).applyMatrix4(t),In[5].set(this.max.x,this.min.y,this.max.z).applyMatrix4(t),In[6].set(this.max.x,this.max.y,this.min.z).applyMatrix4(t),In[7].set(this.max.x,this.max.y,this.max.z).applyMatrix4(t),this.setFromPoints(In),this)}translate(t){return this.min.add(t),this.max.add(t),this}equals(t){return t.min.equals(this.min)&&t.max.equals(this.max)}toJSON(){return{min:this.min.toArray(),max:this.max.toArray()}}fromJSON(t){return this.min.fromArray(t.min),this.max.fromArray(t.max),this}},In=[new L,new L,new L,new L,new L,new L,new L,new L],dn=new L,Mr=new tn,ki=new L,Vi=new L,Hi=new L,Yn=new L,Zn=new L,mi=new L,Ts=new L,Sr=new L,wr=new L,gi=new L;function Vo(i,t,e,n,s){for(let r=0,a=i.length-3;r<=a;r+=3){gi.fromArray(i,r);let o=s.x*Math.abs(gi.x)+s.y*Math.abs(gi.y)+s.z*Math.abs(gi.z),l=t.dot(gi),c=e.dot(gi),u=n.dot(gi);if(Math.max(-Math.max(l,c,u),Math.min(l,c,u))>o)return!1}return!0}var Mu=new tn,As=new L,Ho=new L,zn=class{constructor(t=new L,e=-1){this.isSphere=!0,this.center=t,this.radius=e}set(t,e){return this.center.copy(t),this.radius=e,this}setFromPoints(t,e){let n=this.center;e!==void 0?n.copy(e):Mu.setFromPoints(t).getCenter(n);let s=0;for(let r=0,a=t.length;r<a;r++)s=Math.max(s,n.distanceToSquared(t[r]));return this.radius=Math.sqrt(s),this}copy(t){return this.center.copy(t.center),this.radius=t.radius,this}isEmpty(){return this.radius<0}makeEmpty(){return this.center.set(0,0,0),this.radius=-1,this}containsPoint(t){return t.distanceToSquared(this.center)<=this.radius*this.radius}distanceToPoint(t){return t.distanceTo(this.center)-this.radius}intersectsSphere(t){let e=this.radius+t.radius;return t.center.distanceToSquared(this.center)<=e*e}intersectsBox(t){return t.intersectsSphere(this)}intersectsPlane(t){return Math.abs(t.distanceToPoint(this.center))<=this.radius}clampPoint(t,e){let n=this.center.distanceToSquared(t);return e.copy(t),n>this.radius*this.radius&&(e.sub(this.center).normalize(),e.multiplyScalar(this.radius).add(this.center)),e}getBoundingBox(t){return this.isEmpty()?(t.makeEmpty(),t):(t.set(this.center,this.center),t.expandByScalar(this.radius),t)}applyMatrix4(t){return this.center.applyMatrix4(t),this.radius=this.radius*t.getMaxScaleOnAxis(),this}translate(t){return this.center.add(t),this}expandByPoint(t){if(this.isEmpty())return this.center.copy(t),this.radius=0,this;As.subVectors(t,this.center);let e=As.lengthSq();if(e>this.radius*this.radius){let n=Math.sqrt(e),s=(n-this.radius)*.5;this.center.addScaledVector(As,s/n),this.radius+=s}return this}union(t){return t.isEmpty()?this:this.isEmpty()?(this.copy(t),this):(this.center.equals(t.center)===!0?this.radius=Math.max(this.radius,t.radius):(Ho.subVectors(t.center,this.center).setLength(t.radius),this.expandByPoint(As.copy(t.center).add(Ho)),this.expandByPoint(As.copy(t.center).sub(Ho))),this)}equals(t){return t.center.equals(this.center)&&t.radius===this.radius}clone(){return new this.constructor().copy(this)}toJSON(){return{radius:this.radius,center:this.center.toArray()}}fromJSON(t){return this.radius=t.radius,this.center.fromArray(t.center),this}},Ln=new L,Go=new L,Er=new L,Jn=new L,Wo=new L,Tr=new L,Xo=new L,ii=class{constructor(t=new L,e=new L(0,0,-1)){this.origin=t,this.direction=e}set(t,e){return this.origin.copy(t),this.direction.copy(e),this}copy(t){return this.origin.copy(t.origin),this.direction.copy(t.direction),this}at(t,e){return e.copy(this.origin).addScaledVector(this.direction,t)}lookAt(t){return this.direction.copy(t).sub(this.origin).normalize(),this}recast(t){return this.origin.copy(this.at(t,Ln)),this}closestPointToPoint(t,e){e.subVectors(t,this.origin);let n=e.dot(this.direction);return n<0?e.copy(this.origin):e.copy(this.origin).addScaledVector(this.direction,n)}distanceToPoint(t){return Math.sqrt(this.distanceSqToPoint(t))}distanceSqToPoint(t){let e=Ln.subVectors(t,this.origin).dot(this.direction);return e<0?this.origin.distanceToSquared(t):(Ln.copy(this.origin).addScaledVector(this.direction,e),Ln.distanceToSquared(t))}distanceSqToSegment(t,e,n,s){Go.copy(t).add(e).multiplyScalar(.5),Er.copy(e).sub(t).normalize(),Jn.copy(this.origin).sub(Go);let r=t.distanceTo(e)*.5,a=-this.direction.dot(Er),o=Jn.dot(this.direction),l=-Jn.dot(Er),c=Jn.lengthSq(),u=Math.abs(1-a*a),d,h,f,_;if(u>0)if(d=a*l-o,h=a*o-l,_=r*u,d>=0)if(h>=-_)if(h<=_){let y=1/u;d*=y,h*=y,f=d*(d+a*h+2*o)+h*(a*d+h+2*l)+c}else h=r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h=-r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;else h<=-_?(d=Math.max(0,-(-a*r+o)),h=d>0?-r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c):h<=_?(d=0,h=Math.min(Math.max(-r,-l),r),f=h*(h+2*l)+c):(d=Math.max(0,-(a*r+o)),h=d>0?r:Math.min(Math.max(-r,-l),r),f=-d*d+h*(h+2*l)+c);else h=a>0?-r:r,d=Math.max(0,-(a*h+o)),f=-d*d+h*(h+2*l)+c;return n&&n.copy(this.origin).addScaledVector(this.direction,d),s&&s.copy(Go).addScaledVector(Er,h),f}intersectSphere(t,e){Ln.subVectors(t.center,this.origin);let n=Ln.dot(this.direction),s=Ln.dot(Ln)-n*n,r=t.radius*t.radius;if(s>r)return null;let a=Math.sqrt(r-s),o=n-a,l=n+a;return l<0?null:o<0?this.at(l,e):this.at(o,e)}intersectsSphere(t){return t.radius<0?!1:this.distanceSqToPoint(t.center)<=t.radius*t.radius}distanceToPlane(t){let e=t.normal.dot(this.direction);if(e===0)return t.distanceToPoint(this.origin)===0?0:null;let n=-(this.origin.dot(t.normal)+t.constant)/e;return n>=0?n:null}intersectPlane(t,e){let n=this.distanceToPlane(t);return n===null?null:this.at(n,e)}intersectsPlane(t){let e=t.distanceToPoint(this.origin);return e===0||t.normal.dot(this.direction)*e<0}intersectBox(t,e){let n,s,r,a,o,l,c=1/this.direction.x,u=1/this.direction.y,d=1/this.direction.z,h=this.origin;return c>=0?(n=(t.min.x-h.x)*c,s=(t.max.x-h.x)*c):(n=(t.max.x-h.x)*c,s=(t.min.x-h.x)*c),u>=0?(r=(t.min.y-h.y)*u,a=(t.max.y-h.y)*u):(r=(t.max.y-h.y)*u,a=(t.min.y-h.y)*u),n>a||r>s||((r>n||isNaN(n))&&(n=r),(a<s||isNaN(s))&&(s=a),d>=0?(o=(t.min.z-h.z)*d,l=(t.max.z-h.z)*d):(o=(t.max.z-h.z)*d,l=(t.min.z-h.z)*d),n>l||o>s)||((o>n||n!==n)&&(n=o),(l<s||s!==s)&&(s=l),s<0)?null:this.at(n>=0?n:s,e)}intersectsBox(t){return this.intersectBox(t,Ln)!==null}intersectTriangle(t,e,n,s,r){Wo.subVectors(e,t),Tr.subVectors(n,t),Xo.crossVectors(Wo,Tr);let a=this.direction.dot(Xo),o;if(a>0){if(s)return null;o=1}else if(a<0)o=-1,a=-a;else return null;Jn.subVectors(this.origin,t);let l=o*this.direction.dot(Tr.crossVectors(Jn,Tr));if(l<0)return null;let c=o*this.direction.dot(Wo.cross(Jn));if(c<0||l+c>a)return null;let u=-o*Jn.dot(Xo);return u<0?null:this.at(u/a,r)}applyMatrix4(t){return this.origin.applyMatrix4(t),this.direction.transformDirection(t),this}equals(t){return t.origin.equals(this.origin)&&t.direction.equals(this.direction)}clone(){return new this.constructor().copy(this)}},Jt=class i{constructor(t,e,n,s,r,a,o,l,c,u,d,h,f,_,y,m){i.prototype.isMatrix4=!0,this.elements=[1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1],t!==void 0&&this.set(t,e,n,s,r,a,o,l,c,u,d,h,f,_,y,m)}set(t,e,n,s,r,a,o,l,c,u,d,h,f,_,y,m){let p=this.elements;return p[0]=t,p[4]=e,p[8]=n,p[12]=s,p[1]=r,p[5]=a,p[9]=o,p[13]=l,p[2]=c,p[6]=u,p[10]=d,p[14]=h,p[3]=f,p[7]=_,p[11]=y,p[15]=m,this}identity(){return this.set(1,0,0,0,0,1,0,0,0,0,1,0,0,0,0,1),this}clone(){return new i().fromArray(this.elements)}copy(t){let e=this.elements,n=t.elements;return e[0]=n[0],e[1]=n[1],e[2]=n[2],e[3]=n[3],e[4]=n[4],e[5]=n[5],e[6]=n[6],e[7]=n[7],e[8]=n[8],e[9]=n[9],e[10]=n[10],e[11]=n[11],e[12]=n[12],e[13]=n[13],e[14]=n[14],e[15]=n[15],this}copyPosition(t){let e=this.elements,n=t.elements;return e[12]=n[12],e[13]=n[13],e[14]=n[14],this}setFromMatrix3(t){let e=t.elements;return this.set(e[0],e[3],e[6],0,e[1],e[4],e[7],0,e[2],e[5],e[8],0,0,0,0,1),this}extractBasis(t,e,n){return t.setFromMatrixColumn(this,0),e.setFromMatrixColumn(this,1),n.setFromMatrixColumn(this,2),this}makeBasis(t,e,n){return this.set(t.x,e.x,n.x,0,t.y,e.y,n.y,0,t.z,e.z,n.z,0,0,0,0,1),this}extractRotation(t){let e=this.elements,n=t.elements,s=1/Gi.setFromMatrixColumn(t,0).length(),r=1/Gi.setFromMatrixColumn(t,1).length(),a=1/Gi.setFromMatrixColumn(t,2).length();return e[0]=n[0]*s,e[1]=n[1]*s,e[2]=n[2]*s,e[3]=0,e[4]=n[4]*r,e[5]=n[5]*r,e[6]=n[6]*r,e[7]=0,e[8]=n[8]*a,e[9]=n[9]*a,e[10]=n[10]*a,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromEuler(t){let e=this.elements,n=t.x,s=t.y,r=t.z,a=Math.cos(n),o=Math.sin(n),l=Math.cos(s),c=Math.sin(s),u=Math.cos(r),d=Math.sin(r);if(t.order==="XYZ"){let h=a*u,f=a*d,_=o*u,y=o*d;e[0]=l*u,e[4]=-l*d,e[8]=c,e[1]=f+_*c,e[5]=h-y*c,e[9]=-o*l,e[2]=y-h*c,e[6]=_+f*c,e[10]=a*l}else if(t.order==="YXZ"){let h=l*u,f=l*d,_=c*u,y=c*d;e[0]=h+y*o,e[4]=_*o-f,e[8]=a*c,e[1]=a*d,e[5]=a*u,e[9]=-o,e[2]=f*o-_,e[6]=y+h*o,e[10]=a*l}else if(t.order==="ZXY"){let h=l*u,f=l*d,_=c*u,y=c*d;e[0]=h-y*o,e[4]=-a*d,e[8]=_+f*o,e[1]=f+_*o,e[5]=a*u,e[9]=y-h*o,e[2]=-a*c,e[6]=o,e[10]=a*l}else if(t.order==="ZYX"){let h=a*u,f=a*d,_=o*u,y=o*d;e[0]=l*u,e[4]=_*c-f,e[8]=h*c+y,e[1]=l*d,e[5]=y*c+h,e[9]=f*c-_,e[2]=-c,e[6]=o*l,e[10]=a*l}else if(t.order==="YZX"){let h=a*l,f=a*c,_=o*l,y=o*c;e[0]=l*u,e[4]=y-h*d,e[8]=_*d+f,e[1]=d,e[5]=a*u,e[9]=-o*u,e[2]=-c*u,e[6]=f*d+_,e[10]=h-y*d}else if(t.order==="XZY"){let h=a*l,f=a*c,_=o*l,y=o*c;e[0]=l*u,e[4]=-d,e[8]=c*u,e[1]=h*d+y,e[5]=a*u,e[9]=f*d-_,e[2]=_*d-f,e[6]=o*u,e[10]=y*d+h}return e[3]=0,e[7]=0,e[11]=0,e[12]=0,e[13]=0,e[14]=0,e[15]=1,this}makeRotationFromQuaternion(t){return this.compose(Su,t,wu)}lookAt(t,e,n){let s=this.elements;return je.subVectors(t,e),je.lengthSq()===0&&(je.z=1),je.normalize(),Kn.crossVectors(n,je),Kn.lengthSq()===0&&(Math.abs(n.z)===1?je.x+=1e-4:je.z+=1e-4,je.normalize(),Kn.crossVectors(n,je)),Kn.normalize(),Ar.crossVectors(je,Kn),s[0]=Kn.x,s[4]=Ar.x,s[8]=je.x,s[1]=Kn.y,s[5]=Ar.y,s[9]=je.y,s[2]=Kn.z,s[6]=Ar.z,s[10]=je.z,this}multiply(t){return this.multiplyMatrices(this,t)}premultiply(t){return this.multiplyMatrices(t,this)}multiplyMatrices(t,e){let n=t.elements,s=e.elements,r=this.elements,a=n[0],o=n[4],l=n[8],c=n[12],u=n[1],d=n[5],h=n[9],f=n[13],_=n[2],y=n[6],m=n[10],p=n[14],w=n[3],E=n[7],M=n[11],P=n[15],R=s[0],C=s[4],B=s[8],b=s[12],v=s[1],D=s[5],V=s[9],W=s[13],q=s[2],J=s[6],$=s[10],st=s[14],H=s[3],lt=s[7],pt=s[11],Tt=s[15];return r[0]=a*R+o*v+l*q+c*H,r[4]=a*C+o*D+l*J+c*lt,r[8]=a*B+o*V+l*$+c*pt,r[12]=a*b+o*W+l*st+c*Tt,r[1]=u*R+d*v+h*q+f*H,r[5]=u*C+d*D+h*J+f*lt,r[9]=u*B+d*V+h*$+f*pt,r[13]=u*b+d*W+h*st+f*Tt,r[2]=_*R+y*v+m*q+p*H,r[6]=_*C+y*D+m*J+p*lt,r[10]=_*B+y*V+m*$+p*pt,r[14]=_*b+y*W+m*st+p*Tt,r[3]=w*R+E*v+M*q+P*H,r[7]=w*C+E*D+M*J+P*lt,r[11]=w*B+E*V+M*$+P*pt,r[15]=w*b+E*W+M*st+P*Tt,this}multiplyScalar(t){let e=this.elements;return e[0]*=t,e[4]*=t,e[8]*=t,e[12]*=t,e[1]*=t,e[5]*=t,e[9]*=t,e[13]*=t,e[2]*=t,e[6]*=t,e[10]*=t,e[14]*=t,e[3]*=t,e[7]*=t,e[11]*=t,e[15]*=t,this}determinant(){let t=this.elements,e=t[0],n=t[4],s=t[8],r=t[12],a=t[1],o=t[5],l=t[9],c=t[13],u=t[2],d=t[6],h=t[10],f=t[14],_=t[3],y=t[7],m=t[11],p=t[15];return _*(+r*l*d-s*c*d-r*o*h+n*c*h+s*o*f-n*l*f)+y*(+e*l*f-e*c*h+r*a*h-s*a*f+s*c*u-r*l*u)+m*(+e*c*d-e*o*f-r*a*d+n*a*f+r*o*u-n*c*u)+p*(-s*o*u-e*l*d+e*o*h+s*a*d-n*a*h+n*l*u)}transpose(){let t=this.elements,e;return e=t[1],t[1]=t[4],t[4]=e,e=t[2],t[2]=t[8],t[8]=e,e=t[6],t[6]=t[9],t[9]=e,e=t[3],t[3]=t[12],t[12]=e,e=t[7],t[7]=t[13],t[13]=e,e=t[11],t[11]=t[14],t[14]=e,this}setPosition(t,e,n){let s=this.elements;return t.isVector3?(s[12]=t.x,s[13]=t.y,s[14]=t.z):(s[12]=t,s[13]=e,s[14]=n),this}invert(){let t=this.elements,e=t[0],n=t[1],s=t[2],r=t[3],a=t[4],o=t[5],l=t[6],c=t[7],u=t[8],d=t[9],h=t[10],f=t[11],_=t[12],y=t[13],m=t[14],p=t[15],w=d*m*c-y*h*c+y*l*f-o*m*f-d*l*p+o*h*p,E=_*h*c-u*m*c-_*l*f+a*m*f+u*l*p-a*h*p,M=u*y*c-_*d*c+_*o*f-a*y*f-u*o*p+a*d*p,P=_*d*l-u*y*l-_*o*h+a*y*h+u*o*m-a*d*m,R=e*w+n*E+s*M+r*P;if(R===0)return this.set(0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0);let C=1/R;return t[0]=w*C,t[1]=(y*h*r-d*m*r-y*s*f+n*m*f+d*s*p-n*h*p)*C,t[2]=(o*m*r-y*l*r+y*s*c-n*m*c-o*s*p+n*l*p)*C,t[3]=(d*l*r-o*h*r-d*s*c+n*h*c+o*s*f-n*l*f)*C,t[4]=E*C,t[5]=(u*m*r-_*h*r+_*s*f-e*m*f-u*s*p+e*h*p)*C,t[6]=(_*l*r-a*m*r-_*s*c+e*m*c+a*s*p-e*l*p)*C,t[7]=(a*h*r-u*l*r+u*s*c-e*h*c-a*s*f+e*l*f)*C,t[8]=M*C,t[9]=(_*d*r-u*y*r-_*n*f+e*y*f+u*n*p-e*d*p)*C,t[10]=(a*y*r-_*o*r+_*n*c-e*y*c-a*n*p+e*o*p)*C,t[11]=(u*o*r-a*d*r-u*n*c+e*d*c+a*n*f-e*o*f)*C,t[12]=P*C,t[13]=(u*y*s-_*d*s+_*n*h-e*y*h-u*n*m+e*d*m)*C,t[14]=(_*o*s-a*y*s-_*n*l+e*y*l+a*n*m-e*o*m)*C,t[15]=(a*d*s-u*o*s+u*n*l-e*d*l-a*n*h+e*o*h)*C,this}scale(t){let e=this.elements,n=t.x,s=t.y,r=t.z;return e[0]*=n,e[4]*=s,e[8]*=r,e[1]*=n,e[5]*=s,e[9]*=r,e[2]*=n,e[6]*=s,e[10]*=r,e[3]*=n,e[7]*=s,e[11]*=r,this}getMaxScaleOnAxis(){let t=this.elements,e=t[0]*t[0]+t[1]*t[1]+t[2]*t[2],n=t[4]*t[4]+t[5]*t[5]+t[6]*t[6],s=t[8]*t[8]+t[9]*t[9]+t[10]*t[10];return Math.sqrt(Math.max(e,n,s))}makeTranslation(t,e,n){return t.isVector3?this.set(1,0,0,t.x,0,1,0,t.y,0,0,1,t.z,0,0,0,1):this.set(1,0,0,t,0,1,0,e,0,0,1,n,0,0,0,1),this}makeRotationX(t){let e=Math.cos(t),n=Math.sin(t);return this.set(1,0,0,0,0,e,-n,0,0,n,e,0,0,0,0,1),this}makeRotationY(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,0,n,0,0,1,0,0,-n,0,e,0,0,0,0,1),this}makeRotationZ(t){let e=Math.cos(t),n=Math.sin(t);return this.set(e,-n,0,0,n,e,0,0,0,0,1,0,0,0,0,1),this}makeRotationAxis(t,e){let n=Math.cos(e),s=Math.sin(e),r=1-n,a=t.x,o=t.y,l=t.z,c=r*a,u=r*o;return this.set(c*a+n,c*o-s*l,c*l+s*o,0,c*o+s*l,u*o+n,u*l-s*a,0,c*l-s*o,u*l+s*a,r*l*l+n,0,0,0,0,1),this}makeScale(t,e,n){return this.set(t,0,0,0,0,e,0,0,0,0,n,0,0,0,0,1),this}makeShear(t,e,n,s,r,a){return this.set(1,n,r,0,t,1,a,0,e,s,1,0,0,0,0,1),this}compose(t,e,n){let s=this.elements,r=e._x,a=e._y,o=e._z,l=e._w,c=r+r,u=a+a,d=o+o,h=r*c,f=r*u,_=r*d,y=a*u,m=a*d,p=o*d,w=l*c,E=l*u,M=l*d,P=n.x,R=n.y,C=n.z;return s[0]=(1-(y+p))*P,s[1]=(f+M)*P,s[2]=(_-E)*P,s[3]=0,s[4]=(f-M)*R,s[5]=(1-(h+p))*R,s[6]=(m+w)*R,s[7]=0,s[8]=(_+E)*C,s[9]=(m-w)*C,s[10]=(1-(h+y))*C,s[11]=0,s[12]=t.x,s[13]=t.y,s[14]=t.z,s[15]=1,this}decompose(t,e,n){let s=this.elements,r=Gi.set(s[0],s[1],s[2]).length(),a=Gi.set(s[4],s[5],s[6]).length(),o=Gi.set(s[8],s[9],s[10]).length();this.determinant()<0&&(r=-r),t.x=s[12],t.y=s[13],t.z=s[14],un.copy(this);let c=1/r,u=1/a,d=1/o;return un.elements[0]*=c,un.elements[1]*=c,un.elements[2]*=c,un.elements[4]*=u,un.elements[5]*=u,un.elements[6]*=u,un.elements[8]*=d,un.elements[9]*=d,un.elements[10]*=d,e.setFromRotationMatrix(un),n.x=r,n.y=a,n.z=o,this}makePerspective(t,e,n,s,r,a,o=fn,l=!1){let c=this.elements,u=2*r/(e-t),d=2*r/(n-s),h=(e+t)/(e-t),f=(n+s)/(n-s),_,y;if(l)_=r/(a-r),y=a*r/(a-r);else if(o===fn)_=-(a+r)/(a-r),y=-2*a*r/(a-r);else if(o===Os)_=-a/(a-r),y=-a*r/(a-r);else throw new Error("THREE.Matrix4.makePerspective(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=h,c[12]=0,c[1]=0,c[5]=d,c[9]=f,c[13]=0,c[2]=0,c[6]=0,c[10]=_,c[14]=y,c[3]=0,c[7]=0,c[11]=-1,c[15]=0,this}makeOrthographic(t,e,n,s,r,a,o=fn,l=!1){let c=this.elements,u=2/(e-t),d=2/(n-s),h=-(e+t)/(e-t),f=-(n+s)/(n-s),_,y;if(l)_=1/(a-r),y=a/(a-r);else if(o===fn)_=-2/(a-r),y=-(a+r)/(a-r);else if(o===Os)_=-1/(a-r),y=-r/(a-r);else throw new Error("THREE.Matrix4.makeOrthographic(): Invalid coordinate system: "+o);return c[0]=u,c[4]=0,c[8]=0,c[12]=h,c[1]=0,c[5]=d,c[9]=0,c[13]=f,c[2]=0,c[6]=0,c[10]=_,c[14]=y,c[3]=0,c[7]=0,c[11]=0,c[15]=1,this}equals(t){let e=this.elements,n=t.elements;for(let s=0;s<16;s++)if(e[s]!==n[s])return!1;return!0}fromArray(t,e=0){for(let n=0;n<16;n++)this.elements[n]=t[n+e];return this}toArray(t=[],e=0){let n=this.elements;return t[e]=n[0],t[e+1]=n[1],t[e+2]=n[2],t[e+3]=n[3],t[e+4]=n[4],t[e+5]=n[5],t[e+6]=n[6],t[e+7]=n[7],t[e+8]=n[8],t[e+9]=n[9],t[e+10]=n[10],t[e+11]=n[11],t[e+12]=n[12],t[e+13]=n[13],t[e+14]=n[14],t[e+15]=n[15],t}},Gi=new L,un=new Jt,Su=new L(0,0,0),wu=new L(1,1,1),Kn=new L,Ar=new L,je=new L,Oc=new Jt,Bc=new Ue,gn=class i{constructor(t=0,e=0,n=0,s=i.DEFAULT_ORDER){this.isEuler=!0,this._x=t,this._y=e,this._z=n,this._order=s}get x(){return this._x}set x(t){this._x=t,this._onChangeCallback()}get y(){return this._y}set y(t){this._y=t,this._onChangeCallback()}get z(){return this._z}set z(t){this._z=t,this._onChangeCallback()}get order(){return this._order}set order(t){this._order=t,this._onChangeCallback()}set(t,e,n,s=this._order){return this._x=t,this._y=e,this._z=n,this._order=s,this._onChangeCallback(),this}clone(){return new this.constructor(this._x,this._y,this._z,this._order)}copy(t){return this._x=t._x,this._y=t._y,this._z=t._z,this._order=t._order,this._onChangeCallback(),this}setFromRotationMatrix(t,e=this._order,n=!0){let s=t.elements,r=s[0],a=s[4],o=s[8],l=s[1],c=s[5],u=s[9],d=s[2],h=s[6],f=s[10];switch(e){case"XYZ":this._y=Math.asin(Ht(o,-1,1)),Math.abs(o)<.9999999?(this._x=Math.atan2(-u,f),this._z=Math.atan2(-a,r)):(this._x=Math.atan2(h,c),this._z=0);break;case"YXZ":this._x=Math.asin(-Ht(u,-1,1)),Math.abs(u)<.9999999?(this._y=Math.atan2(o,f),this._z=Math.atan2(l,c)):(this._y=Math.atan2(-d,r),this._z=0);break;case"ZXY":this._x=Math.asin(Ht(h,-1,1)),Math.abs(h)<.9999999?(this._y=Math.atan2(-d,f),this._z=Math.atan2(-a,c)):(this._y=0,this._z=Math.atan2(l,r));break;case"ZYX":this._y=Math.asin(-Ht(d,-1,1)),Math.abs(d)<.9999999?(this._x=Math.atan2(h,f),this._z=Math.atan2(l,r)):(this._x=0,this._z=Math.atan2(-a,c));break;case"YZX":this._z=Math.asin(Ht(l,-1,1)),Math.abs(l)<.9999999?(this._x=Math.atan2(-u,c),this._y=Math.atan2(-d,r)):(this._x=0,this._y=Math.atan2(o,f));break;case"XZY":this._z=Math.asin(-Ht(a,-1,1)),Math.abs(a)<.9999999?(this._x=Math.atan2(h,c),this._y=Math.atan2(o,r)):(this._x=Math.atan2(-u,f),this._y=0);break;default:console.warn("THREE.Euler: .setFromRotationMatrix() encountered an unknown order: "+e)}return this._order=e,n===!0&&this._onChangeCallback(),this}setFromQuaternion(t,e,n){return Oc.makeRotationFromQuaternion(t),this.setFromRotationMatrix(Oc,e,n)}setFromVector3(t,e=this._order){return this.set(t.x,t.y,t.z,e)}reorder(t){return Bc.setFromEuler(this),this.setFromQuaternion(Bc,t)}equals(t){return t._x===this._x&&t._y===this._y&&t._z===this._z&&t._order===this._order}fromArray(t){return this._x=t[0],this._y=t[1],this._z=t[2],t[3]!==void 0&&(this._order=t[3]),this._onChangeCallback(),this}toArray(t=[],e=0){return t[e]=this._x,t[e+1]=this._y,t[e+2]=this._z,t[e+3]=this._order,t}_onChange(t){return this._onChangeCallback=t,this}_onChangeCallback(){}*[Symbol.iterator](){yield this._x,yield this._y,yield this._z,yield this._order}};gn.DEFAULT_ORDER="XYZ";var ss=class{constructor(){this.mask=1}set(t){this.mask=(1<<t|0)>>>0}enable(t){this.mask|=1<<t|0}enableAll(){this.mask=-1}toggle(t){this.mask^=1<<t|0}disable(t){this.mask&=~(1<<t|0)}disableAll(){this.mask=0}test(t){return(this.mask&t.mask)!==0}isEnabled(t){return(this.mask&(1<<t|0))!==0}},Eu=0,zc=new L,Wi=new Ue,Dn=new Jt,Cr=new L,Cs=new L,Tu=new L,Au=new Ue,kc=new L(1,0,0),Vc=new L(0,1,0),Hc=new L(0,0,1),Gc={type:"added"},Cu={type:"removed"},Xi={type:"childadded",child:null},$o={type:"childremoved",child:null},Ee=class i extends wn{constructor(){super(),this.isObject3D=!0,Object.defineProperty(this,"id",{value:Eu++}),this.uuid=ps(),this.name="",this.type="Object3D",this.parent=null,this.children=[],this.up=i.DEFAULT_UP.clone();let t=new L,e=new gn,n=new Ue,s=new L(1,1,1);function r(){n.setFromEuler(e,!1)}function a(){e.setFromQuaternion(n,void 0,!1)}e._onChange(r),n._onChange(a),Object.defineProperties(this,{position:{configurable:!0,enumerable:!0,value:t},rotation:{configurable:!0,enumerable:!0,value:e},quaternion:{configurable:!0,enumerable:!0,value:n},scale:{configurable:!0,enumerable:!0,value:s},modelViewMatrix:{value:new Jt},normalMatrix:{value:new Ot}}),this.matrix=new Jt,this.matrixWorld=new Jt,this.matrixAutoUpdate=i.DEFAULT_MATRIX_AUTO_UPDATE,this.matrixWorldAutoUpdate=i.DEFAULT_MATRIX_WORLD_AUTO_UPDATE,this.matrixWorldNeedsUpdate=!1,this.layers=new ss,this.visible=!0,this.castShadow=!1,this.receiveShadow=!1,this.frustumCulled=!0,this.renderOrder=0,this.animations=[],this.customDepthMaterial=void 0,this.customDistanceMaterial=void 0,this.userData={}}onBeforeShadow(){}onAfterShadow(){}onBeforeRender(){}onAfterRender(){}applyMatrix4(t){this.matrixAutoUpdate&&this.updateMatrix(),this.matrix.premultiply(t),this.matrix.decompose(this.position,this.quaternion,this.scale)}applyQuaternion(t){return this.quaternion.premultiply(t),this}setRotationFromAxisAngle(t,e){this.quaternion.setFromAxisAngle(t,e)}setRotationFromEuler(t){this.quaternion.setFromEuler(t,!0)}setRotationFromMatrix(t){this.quaternion.setFromRotationMatrix(t)}setRotationFromQuaternion(t){this.quaternion.copy(t)}rotateOnAxis(t,e){return Wi.setFromAxisAngle(t,e),this.quaternion.multiply(Wi),this}rotateOnWorldAxis(t,e){return Wi.setFromAxisAngle(t,e),this.quaternion.premultiply(Wi),this}rotateX(t){return this.rotateOnAxis(kc,t)}rotateY(t){return this.rotateOnAxis(Vc,t)}rotateZ(t){return this.rotateOnAxis(Hc,t)}translateOnAxis(t,e){return zc.copy(t).applyQuaternion(this.quaternion),this.position.add(zc.multiplyScalar(e)),this}translateX(t){return this.translateOnAxis(kc,t)}translateY(t){return this.translateOnAxis(Vc,t)}translateZ(t){return this.translateOnAxis(Hc,t)}localToWorld(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(this.matrixWorld)}worldToLocal(t){return this.updateWorldMatrix(!0,!1),t.applyMatrix4(Dn.copy(this.matrixWorld).invert())}lookAt(t,e,n){t.isVector3?Cr.copy(t):Cr.set(t,e,n);let s=this.parent;this.updateWorldMatrix(!0,!1),Cs.setFromMatrixPosition(this.matrixWorld),this.isCamera||this.isLight?Dn.lookAt(Cs,Cr,this.up):Dn.lookAt(Cr,Cs,this.up),this.quaternion.setFromRotationMatrix(Dn),s&&(Dn.extractRotation(s.matrixWorld),Wi.setFromRotationMatrix(Dn),this.quaternion.premultiply(Wi.invert()))}add(t){if(arguments.length>1){for(let e=0;e<arguments.length;e++)this.add(arguments[e]);return this}return t===this?(console.error("THREE.Object3D.add: object can't be added as a child of itself.",t),this):(t&&t.isObject3D?(t.removeFromParent(),t.parent=this,this.children.push(t),t.dispatchEvent(Gc),Xi.child=t,this.dispatchEvent(Xi),Xi.child=null):console.error("THREE.Object3D.add: object not an instance of THREE.Object3D.",t),this)}remove(t){if(arguments.length>1){for(let n=0;n<arguments.length;n++)this.remove(arguments[n]);return this}let e=this.children.indexOf(t);return e!==-1&&(t.parent=null,this.children.splice(e,1),t.dispatchEvent(Cu),$o.child=t,this.dispatchEvent($o),$o.child=null),this}removeFromParent(){let t=this.parent;return t!==null&&t.remove(this),this}clear(){return this.remove(...this.children)}attach(t){return this.updateWorldMatrix(!0,!1),Dn.copy(this.matrixWorld).invert(),t.parent!==null&&(t.parent.updateWorldMatrix(!0,!1),Dn.multiply(t.parent.matrixWorld)),t.applyMatrix4(Dn),t.removeFromParent(),t.parent=this,this.children.push(t),t.updateWorldMatrix(!1,!0),t.dispatchEvent(Gc),Xi.child=t,this.dispatchEvent(Xi),Xi.child=null,this}getObjectById(t){return this.getObjectByProperty("id",t)}getObjectByName(t){return this.getObjectByProperty("name",t)}getObjectByProperty(t,e){if(this[t]===e)return this;for(let n=0,s=this.children.length;n<s;n++){let a=this.children[n].getObjectByProperty(t,e);if(a!==void 0)return a}}getObjectsByProperty(t,e,n=[]){this[t]===e&&n.push(this);let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].getObjectsByProperty(t,e,n);return n}getWorldPosition(t){return this.updateWorldMatrix(!0,!1),t.setFromMatrixPosition(this.matrixWorld)}getWorldQuaternion(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cs,t,Tu),t}getWorldScale(t){return this.updateWorldMatrix(!0,!1),this.matrixWorld.decompose(Cs,Au,t),t}getWorldDirection(t){this.updateWorldMatrix(!0,!1);let e=this.matrixWorld.elements;return t.set(e[8],e[9],e[10]).normalize()}raycast(){}traverse(t){t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverse(t)}traverseVisible(t){if(this.visible===!1)return;t(this);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].traverseVisible(t)}traverseAncestors(t){let e=this.parent;e!==null&&(t(e),e.traverseAncestors(t))}updateMatrix(){this.matrix.compose(this.position,this.quaternion,this.scale),this.matrixWorldNeedsUpdate=!0}updateMatrixWorld(t){this.matrixAutoUpdate&&this.updateMatrix(),(this.matrixWorldNeedsUpdate||t)&&(this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),this.matrixWorldNeedsUpdate=!1,t=!0);let e=this.children;for(let n=0,s=e.length;n<s;n++)e[n].updateMatrixWorld(t)}updateWorldMatrix(t,e){let n=this.parent;if(t===!0&&n!==null&&n.updateWorldMatrix(!0,!1),this.matrixAutoUpdate&&this.updateMatrix(),this.matrixWorldAutoUpdate===!0&&(this.parent===null?this.matrixWorld.copy(this.matrix):this.matrixWorld.multiplyMatrices(this.parent.matrixWorld,this.matrix)),e===!0){let s=this.children;for(let r=0,a=s.length;r<a;r++)s[r].updateWorldMatrix(!1,!0)}}toJSON(t){let e=t===void 0||typeof t=="string",n={};e&&(t={geometries:{},materials:{},textures:{},images:{},shapes:{},skeletons:{},animations:{},nodes:{}},n.metadata={version:4.7,type:"Object",generator:"Object3D.toJSON"});let s={};s.uuid=this.uuid,s.type=this.type,this.name!==""&&(s.name=this.name),this.castShadow===!0&&(s.castShadow=!0),this.receiveShadow===!0&&(s.receiveShadow=!0),this.visible===!1&&(s.visible=!1),this.frustumCulled===!1&&(s.frustumCulled=!1),this.renderOrder!==0&&(s.renderOrder=this.renderOrder),Object.keys(this.userData).length>0&&(s.userData=this.userData),s.layers=this.layers.mask,s.matrix=this.matrix.toArray(),s.up=this.up.toArray(),this.matrixAutoUpdate===!1&&(s.matrixAutoUpdate=!1),this.isInstancedMesh&&(s.type="InstancedMesh",s.count=this.count,s.instanceMatrix=this.instanceMatrix.toJSON(),this.instanceColor!==null&&(s.instanceColor=this.instanceColor.toJSON())),this.isBatchedMesh&&(s.type="BatchedMesh",s.perObjectFrustumCulled=this.perObjectFrustumCulled,s.sortObjects=this.sortObjects,s.drawRanges=this._drawRanges,s.reservedRanges=this._reservedRanges,s.geometryInfo=this._geometryInfo.map(o=>({...o,boundingBox:o.boundingBox?o.boundingBox.toJSON():void 0,boundingSphere:o.boundingSphere?o.boundingSphere.toJSON():void 0})),s.instanceInfo=this._instanceInfo.map(o=>({...o})),s.availableInstanceIds=this._availableInstanceIds.slice(),s.availableGeometryIds=this._availableGeometryIds.slice(),s.nextIndexStart=this._nextIndexStart,s.nextVertexStart=this._nextVertexStart,s.geometryCount=this._geometryCount,s.maxInstanceCount=this._maxInstanceCount,s.maxVertexCount=this._maxVertexCount,s.maxIndexCount=this._maxIndexCount,s.geometryInitialized=this._geometryInitialized,s.matricesTexture=this._matricesTexture.toJSON(t),s.indirectTexture=this._indirectTexture.toJSON(t),this._colorsTexture!==null&&(s.colorsTexture=this._colorsTexture.toJSON(t)),this.boundingSphere!==null&&(s.boundingSphere=this.boundingSphere.toJSON()),this.boundingBox!==null&&(s.boundingBox=this.boundingBox.toJSON()));function r(o,l){return o[l.uuid]===void 0&&(o[l.uuid]=l.toJSON(t)),l.uuid}if(this.isScene)this.background&&(this.background.isColor?s.background=this.background.toJSON():this.background.isTexture&&(s.background=this.background.toJSON(t).uuid)),this.environment&&this.environment.isTexture&&this.environment.isRenderTargetTexture!==!0&&(s.environment=this.environment.toJSON(t).uuid);else if(this.isMesh||this.isLine||this.isPoints){s.geometry=r(t.geometries,this.geometry);let o=this.geometry.parameters;if(o!==void 0&&o.shapes!==void 0){let l=o.shapes;if(Array.isArray(l))for(let c=0,u=l.length;c<u;c++){let d=l[c];r(t.shapes,d)}else r(t.shapes,l)}}if(this.isSkinnedMesh&&(s.bindMode=this.bindMode,s.bindMatrix=this.bindMatrix.toArray(),this.skeleton!==void 0&&(r(t.skeletons,this.skeleton),s.skeleton=this.skeleton.uuid)),this.material!==void 0)if(Array.isArray(this.material)){let o=[];for(let l=0,c=this.material.length;l<c;l++)o.push(r(t.materials,this.material[l]));s.material=o}else s.material=r(t.materials,this.material);if(this.children.length>0){s.children=[];for(let o=0;o<this.children.length;o++)s.children.push(this.children[o].toJSON(t).object)}if(this.animations.length>0){s.animations=[];for(let o=0;o<this.animations.length;o++){let l=this.animations[o];s.animations.push(r(t.animations,l))}}if(e){let o=a(t.geometries),l=a(t.materials),c=a(t.textures),u=a(t.images),d=a(t.shapes),h=a(t.skeletons),f=a(t.animations),_=a(t.nodes);o.length>0&&(n.geometries=o),l.length>0&&(n.materials=l),c.length>0&&(n.textures=c),u.length>0&&(n.images=u),d.length>0&&(n.shapes=d),h.length>0&&(n.skeletons=h),f.length>0&&(n.animations=f),_.length>0&&(n.nodes=_)}return n.object=s,n;function a(o){let l=[];for(let c in o){let u=o[c];delete u.metadata,l.push(u)}return l}}clone(t){return new this.constructor().copy(this,t)}copy(t,e=!0){if(this.name=t.name,this.up.copy(t.up),this.position.copy(t.position),this.rotation.order=t.rotation.order,this.quaternion.copy(t.quaternion),this.scale.copy(t.scale),this.matrix.copy(t.matrix),this.matrixWorld.copy(t.matrixWorld),this.matrixAutoUpdate=t.matrixAutoUpdate,this.matrixWorldAutoUpdate=t.matrixWorldAutoUpdate,this.matrixWorldNeedsUpdate=t.matrixWorldNeedsUpdate,this.layers.mask=t.layers.mask,this.visible=t.visible,this.castShadow=t.castShadow,this.receiveShadow=t.receiveShadow,this.frustumCulled=t.frustumCulled,this.renderOrder=t.renderOrder,this.animations=t.animations.slice(),this.userData=JSON.parse(JSON.stringify(t.userData)),e===!0)for(let n=0;n<t.children.length;n++){let s=t.children[n];this.add(s.clone())}return this}};Ee.DEFAULT_UP=new L(0,1,0);Ee.DEFAULT_MATRIX_AUTO_UPDATE=!0;Ee.DEFAULT_MATRIX_WORLD_AUTO_UPDATE=!0;var pn=new L,Nn=new L,qo=new L,Un=new L,$i=new L,qi=new L,Wc=new L,Yo=new L,Zo=new L,Jo=new L,Ko=new de,jo=new de,Qo=new de,ti=class i{constructor(t=new L,e=new L,n=new L){this.a=t,this.b=e,this.c=n}static getNormal(t,e,n,s){s.subVectors(n,e),pn.subVectors(t,e),s.cross(pn);let r=s.lengthSq();return r>0?s.multiplyScalar(1/Math.sqrt(r)):s.set(0,0,0)}static getBarycoord(t,e,n,s,r){pn.subVectors(s,e),Nn.subVectors(n,e),qo.subVectors(t,e);let a=pn.dot(pn),o=pn.dot(Nn),l=pn.dot(qo),c=Nn.dot(Nn),u=Nn.dot(qo),d=a*c-o*o;if(d===0)return r.set(0,0,0),null;let h=1/d,f=(c*l-o*u)*h,_=(a*u-o*l)*h;return r.set(1-f-_,_,f)}static containsPoint(t,e,n,s){return this.getBarycoord(t,e,n,s,Un)===null?!1:Un.x>=0&&Un.y>=0&&Un.x+Un.y<=1}static getInterpolation(t,e,n,s,r,a,o,l){return this.getBarycoord(t,e,n,s,Un)===null?(l.x=0,l.y=0,"z"in l&&(l.z=0),"w"in l&&(l.w=0),null):(l.setScalar(0),l.addScaledVector(r,Un.x),l.addScaledVector(a,Un.y),l.addScaledVector(o,Un.z),l)}static getInterpolatedAttribute(t,e,n,s,r,a){return Ko.setScalar(0),jo.setScalar(0),Qo.setScalar(0),Ko.fromBufferAttribute(t,e),jo.fromBufferAttribute(t,n),Qo.fromBufferAttribute(t,s),a.setScalar(0),a.addScaledVector(Ko,r.x),a.addScaledVector(jo,r.y),a.addScaledVector(Qo,r.z),a}static isFrontFacing(t,e,n,s){return pn.subVectors(n,e),Nn.subVectors(t,e),pn.cross(Nn).dot(s)<0}set(t,e,n){return this.a.copy(t),this.b.copy(e),this.c.copy(n),this}setFromPointsAndIndices(t,e,n,s){return this.a.copy(t[e]),this.b.copy(t[n]),this.c.copy(t[s]),this}setFromAttributeAndIndices(t,e,n,s){return this.a.fromBufferAttribute(t,e),this.b.fromBufferAttribute(t,n),this.c.fromBufferAttribute(t,s),this}clone(){return new this.constructor().copy(this)}copy(t){return this.a.copy(t.a),this.b.copy(t.b),this.c.copy(t.c),this}getArea(){return pn.subVectors(this.c,this.b),Nn.subVectors(this.a,this.b),pn.cross(Nn).length()*.5}getMidpoint(t){return t.addVectors(this.a,this.b).add(this.c).multiplyScalar(1/3)}getNormal(t){return i.getNormal(this.a,this.b,this.c,t)}getPlane(t){return t.setFromCoplanarPoints(this.a,this.b,this.c)}getBarycoord(t,e){return i.getBarycoord(t,this.a,this.b,this.c,e)}getInterpolation(t,e,n,s,r){return i.getInterpolation(t,this.a,this.b,this.c,e,n,s,r)}containsPoint(t){return i.containsPoint(t,this.a,this.b,this.c)}isFrontFacing(t){return i.isFrontFacing(this.a,this.b,this.c,t)}intersectsBox(t){return t.intersectsTriangle(this)}closestPointToPoint(t,e){let n=this.a,s=this.b,r=this.c,a,o;$i.subVectors(s,n),qi.subVectors(r,n),Yo.subVectors(t,n);let l=$i.dot(Yo),c=qi.dot(Yo);if(l<=0&&c<=0)return e.copy(n);Zo.subVectors(t,s);let u=$i.dot(Zo),d=qi.dot(Zo);if(u>=0&&d<=u)return e.copy(s);let h=l*d-u*c;if(h<=0&&l>=0&&u<=0)return a=l/(l-u),e.copy(n).addScaledVector($i,a);Jo.subVectors(t,r);let f=$i.dot(Jo),_=qi.dot(Jo);if(_>=0&&f<=_)return e.copy(r);let y=f*c-l*_;if(y<=0&&c>=0&&_<=0)return o=c/(c-_),e.copy(n).addScaledVector(qi,o);let m=u*_-f*d;if(m<=0&&d-u>=0&&f-_>=0)return Wc.subVectors(r,s),o=(d-u)/(d-u+(f-_)),e.copy(s).addScaledVector(Wc,o);let p=1/(m+y+h);return a=y*p,o=h*p,e.copy(n).addScaledVector($i,a).addScaledVector(qi,o)}equals(t){return t.a.equals(this.a)&&t.b.equals(this.b)&&t.c.equals(this.c)}},qh={aliceblue:15792383,antiquewhite:16444375,aqua:65535,aquamarine:8388564,azure:15794175,beige:16119260,bisque:16770244,black:0,blanchedalmond:16772045,blue:255,blueviolet:9055202,brown:10824234,burlywood:14596231,cadetblue:6266528,chartreuse:8388352,chocolate:13789470,coral:16744272,cornflowerblue:6591981,cornsilk:16775388,crimson:14423100,cyan:65535,darkblue:139,darkcyan:35723,darkgoldenrod:12092939,darkgray:11119017,darkgreen:25600,darkgrey:11119017,darkkhaki:12433259,darkmagenta:9109643,darkolivegreen:5597999,darkorange:16747520,darkorchid:10040012,darkred:9109504,darksalmon:15308410,darkseagreen:9419919,darkslateblue:4734347,darkslategray:3100495,darkslategrey:3100495,darkturquoise:52945,darkviolet:9699539,deeppink:16716947,deepskyblue:49151,dimgray:6908265,dimgrey:6908265,dodgerblue:2003199,firebrick:11674146,floralwhite:16775920,forestgreen:2263842,fuchsia:16711935,gainsboro:14474460,ghostwhite:16316671,gold:16766720,goldenrod:14329120,gray:8421504,green:32768,greenyellow:11403055,grey:8421504,honeydew:15794160,hotpink:16738740,indianred:13458524,indigo:4915330,ivory:16777200,khaki:15787660,lavender:15132410,lavenderblush:16773365,lawngreen:8190976,lemonchiffon:16775885,lightblue:11393254,lightcoral:15761536,lightcyan:14745599,lightgoldenrodyellow:16448210,lightgray:13882323,lightgreen:9498256,lightgrey:13882323,lightpink:16758465,lightsalmon:16752762,lightseagreen:2142890,lightskyblue:8900346,lightslategray:7833753,lightslategrey:7833753,lightsteelblue:11584734,lightyellow:16777184,lime:65280,limegreen:3329330,linen:16445670,magenta:16711935,maroon:8388608,mediumaquamarine:6737322,mediumblue:205,mediumorchid:12211667,mediumpurple:9662683,mediumseagreen:3978097,mediumslateblue:8087790,mediumspringgreen:64154,mediumturquoise:4772300,mediumvioletred:13047173,midnightblue:1644912,mintcream:16121850,mistyrose:16770273,moccasin:16770229,navajowhite:16768685,navy:128,oldlace:16643558,olive:8421376,olivedrab:7048739,orange:16753920,orangered:16729344,orchid:14315734,palegoldenrod:15657130,palegreen:10025880,paleturquoise:11529966,palevioletred:14381203,papayawhip:16773077,peachpuff:16767673,peru:13468991,pink:16761035,plum:14524637,powderblue:11591910,purple:8388736,rebeccapurple:6697881,red:16711680,rosybrown:12357519,royalblue:4286945,saddlebrown:9127187,salmon:16416882,sandybrown:16032864,seagreen:3050327,seashell:16774638,sienna:10506797,silver:12632256,skyblue:8900331,slateblue:6970061,slategray:7372944,slategrey:7372944,snow:16775930,springgreen:65407,steelblue:4620980,tan:13808780,teal:32896,thistle:14204888,tomato:16737095,turquoise:4251856,violet:15631086,wheat:16113331,white:16777215,whitesmoke:16119285,yellow:16776960,yellowgreen:10145074},jn={h:0,s:0,l:0},Rr={h:0,s:0,l:0};function tl(i,t,e){return e<0&&(e+=1),e>1&&(e-=1),e<1/6?i+(t-i)*6*e:e<1/2?t:e<2/3?i+(t-i)*6*(2/3-e):i}var kt=class{constructor(t,e,n){return this.isColor=!0,this.r=1,this.g=1,this.b=1,this.set(t,e,n)}set(t,e,n){if(e===void 0&&n===void 0){let s=t;s&&s.isColor?this.copy(s):typeof s=="number"?this.setHex(s):typeof s=="string"&&this.setStyle(s)}else this.setRGB(t,e,n);return this}setScalar(t){return this.r=t,this.g=t,this.b=t,this}setHex(t,e=ze){return t=Math.floor(t),this.r=(t>>16&255)/255,this.g=(t>>8&255)/255,this.b=(t&255)/255,$t.colorSpaceToWorking(this,e),this}setRGB(t,e,n,s=$t.workingColorSpace){return this.r=t,this.g=e,this.b=n,$t.colorSpaceToWorking(this,s),this}setHSL(t,e,n,s=$t.workingColorSpace){if(t=Dl(t,1),e=Ht(e,0,1),n=Ht(n,0,1),e===0)this.r=this.g=this.b=n;else{let r=n<=.5?n*(1+e):n+e-n*e,a=2*n-r;this.r=tl(a,r,t+1/3),this.g=tl(a,r,t),this.b=tl(a,r,t-1/3)}return $t.colorSpaceToWorking(this,s),this}setStyle(t,e=ze){function n(r){r!==void 0&&parseFloat(r)<1&&console.warn("THREE.Color: Alpha component of "+t+" will be ignored.")}let s;if(s=/^(\w+)\(([^\)]*)\)/.exec(t)){let r,a=s[1],o=s[2];switch(a){case"rgb":case"rgba":if(r=/^\s*(\d+)\s*,\s*(\d+)\s*,\s*(\d+)\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(255,parseInt(r[1],10))/255,Math.min(255,parseInt(r[2],10))/255,Math.min(255,parseInt(r[3],10))/255,e);if(r=/^\s*(\d+)\%\s*,\s*(\d+)\%\s*,\s*(\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setRGB(Math.min(100,parseInt(r[1],10))/100,Math.min(100,parseInt(r[2],10))/100,Math.min(100,parseInt(r[3],10))/100,e);break;case"hsl":case"hsla":if(r=/^\s*(\d*\.?\d+)\s*,\s*(\d*\.?\d+)\%\s*,\s*(\d*\.?\d+)\%\s*(?:,\s*(\d*\.?\d+)\s*)?$/.exec(o))return n(r[4]),this.setHSL(parseFloat(r[1])/360,parseFloat(r[2])/100,parseFloat(r[3])/100,e);break;default:console.warn("THREE.Color: Unknown color model "+t)}}else if(s=/^\#([A-Fa-f\d]+)$/.exec(t)){let r=s[1],a=r.length;if(a===3)return this.setRGB(parseInt(r.charAt(0),16)/15,parseInt(r.charAt(1),16)/15,parseInt(r.charAt(2),16)/15,e);if(a===6)return this.setHex(parseInt(r,16),e);console.warn("THREE.Color: Invalid hex color "+t)}else if(t&&t.length>0)return this.setColorName(t,e);return this}setColorName(t,e=ze){let n=qh[t.toLowerCase()];return n!==void 0?this.setHex(n,e):console.warn("THREE.Color: Unknown color "+t),this}clone(){return new this.constructor(this.r,this.g,this.b)}copy(t){return this.r=t.r,this.g=t.g,this.b=t.b,this}copySRGBToLinear(t){return this.r=On(t.r),this.g=On(t.g),this.b=On(t.b),this}copyLinearToSRGB(t){return this.r=Qi(t.r),this.g=Qi(t.g),this.b=Qi(t.b),this}convertSRGBToLinear(){return this.copySRGBToLinear(this),this}convertLinearToSRGB(){return this.copyLinearToSRGB(this),this}getHex(t=ze){return $t.workingToColorSpace(De.copy(this),t),Math.round(Ht(De.r*255,0,255))*65536+Math.round(Ht(De.g*255,0,255))*256+Math.round(Ht(De.b*255,0,255))}getHexString(t=ze){return("000000"+this.getHex(t).toString(16)).slice(-6)}getHSL(t,e=$t.workingColorSpace){$t.workingToColorSpace(De.copy(this),e);let n=De.r,s=De.g,r=De.b,a=Math.max(n,s,r),o=Math.min(n,s,r),l,c,u=(o+a)/2;if(o===a)l=0,c=0;else{let d=a-o;switch(c=u<=.5?d/(a+o):d/(2-a-o),a){case n:l=(s-r)/d+(s<r?6:0);break;case s:l=(r-n)/d+2;break;case r:l=(n-s)/d+4;break}l/=6}return t.h=l,t.s=c,t.l=u,t}getRGB(t,e=$t.workingColorSpace){return $t.workingToColorSpace(De.copy(this),e),t.r=De.r,t.g=De.g,t.b=De.b,t}getStyle(t=ze){$t.workingToColorSpace(De.copy(this),t);let e=De.r,n=De.g,s=De.b;return t!==ze?`color(${t} ${e.toFixed(3)} ${n.toFixed(3)} ${s.toFixed(3)})`:`rgb(${Math.round(e*255)},${Math.round(n*255)},${Math.round(s*255)})`}offsetHSL(t,e,n){return this.getHSL(jn),this.setHSL(jn.h+t,jn.s+e,jn.l+n)}add(t){return this.r+=t.r,this.g+=t.g,this.b+=t.b,this}addColors(t,e){return this.r=t.r+e.r,this.g=t.g+e.g,this.b=t.b+e.b,this}addScalar(t){return this.r+=t,this.g+=t,this.b+=t,this}sub(t){return this.r=Math.max(0,this.r-t.r),this.g=Math.max(0,this.g-t.g),this.b=Math.max(0,this.b-t.b),this}multiply(t){return this.r*=t.r,this.g*=t.g,this.b*=t.b,this}multiplyScalar(t){return this.r*=t,this.g*=t,this.b*=t,this}lerp(t,e){return this.r+=(t.r-this.r)*e,this.g+=(t.g-this.g)*e,this.b+=(t.b-this.b)*e,this}lerpColors(t,e,n){return this.r=t.r+(e.r-t.r)*n,this.g=t.g+(e.g-t.g)*n,this.b=t.b+(e.b-t.b)*n,this}lerpHSL(t,e){this.getHSL(jn),t.getHSL(Rr);let n=Ns(jn.h,Rr.h,e),s=Ns(jn.s,Rr.s,e),r=Ns(jn.l,Rr.l,e);return this.setHSL(n,s,r),this}setFromVector3(t){return this.r=t.x,this.g=t.y,this.b=t.z,this}applyMatrix3(t){let e=this.r,n=this.g,s=this.b,r=t.elements;return this.r=r[0]*e+r[3]*n+r[6]*s,this.g=r[1]*e+r[4]*n+r[7]*s,this.b=r[2]*e+r[5]*n+r[8]*s,this}equals(t){return t.r===this.r&&t.g===this.g&&t.b===this.b}fromArray(t,e=0){return this.r=t[e],this.g=t[e+1],this.b=t[e+2],this}toArray(t=[],e=0){return t[e]=this.r,t[e+1]=this.g,t[e+2]=this.b,t}fromBufferAttribute(t,e){return this.r=t.getX(e),this.g=t.getY(e),this.b=t.getZ(e),this}toJSON(){return this.getHex()}*[Symbol.iterator](){yield this.r,yield this.g,yield this.b}},De=new kt;kt.NAMES=qh;var Ru=0,kn=class extends wn{constructor(){super(),this.isMaterial=!0,Object.defineProperty(this,"id",{value:Ru++}),this.uuid=ps(),this.name="",this.type="Material",this.blending=vi,this.side=Bn,this.vertexColors=!1,this.opacity=1,this.transparent=!1,this.alphaHash=!1,this.blendSrc=Wr,this.blendDst=Xr,this.blendEquation=ni,this.blendSrcAlpha=null,this.blendDstAlpha=null,this.blendEquationAlpha=null,this.blendColor=new kt(0,0,0),this.blendAlpha=0,this.depthFunc=bi,this.depthTest=!0,this.depthWrite=!0,this.stencilWriteMask=255,this.stencilFunc=cl,this.stencilRef=0,this.stencilFuncMask=255,this.stencilFail=yi,this.stencilZFail=yi,this.stencilZPass=yi,this.stencilWrite=!1,this.clippingPlanes=null,this.clipIntersection=!1,this.clipShadows=!1,this.shadowSide=null,this.colorWrite=!0,this.precision=null,this.polygonOffset=!1,this.polygonOffsetFactor=0,this.polygonOffsetUnits=0,this.dithering=!1,this.alphaToCoverage=!1,this.premultipliedAlpha=!1,this.forceSinglePass=!1,this.allowOverride=!0,this.visible=!0,this.toneMapped=!0,this.userData={},this.version=0,this._alphaTest=0}get alphaTest(){return this._alphaTest}set alphaTest(t){this._alphaTest>0!=t>0&&this.version++,this._alphaTest=t}onBeforeRender(){}onBeforeCompile(){}customProgramCacheKey(){return this.onBeforeCompile.toString()}setValues(t){if(t!==void 0)for(let e in t){let n=t[e];if(n===void 0){console.warn(`THREE.Material: parameter '${e}' has value of undefined.`);continue}let s=this[e];if(s===void 0){console.warn(`THREE.Material: '${e}' is not a property of THREE.${this.type}.`);continue}s&&s.isColor?s.set(n):s&&s.isVector3&&n&&n.isVector3?s.copy(n):this[e]=n}}toJSON(t){let e=t===void 0||typeof t=="string";e&&(t={textures:{},images:{}});let n={metadata:{version:4.7,type:"Material",generator:"Material.toJSON"}};n.uuid=this.uuid,n.type=this.type,this.name!==""&&(n.name=this.name),this.color&&this.color.isColor&&(n.color=this.color.getHex()),this.roughness!==void 0&&(n.roughness=this.roughness),this.metalness!==void 0&&(n.metalness=this.metalness),this.sheen!==void 0&&(n.sheen=this.sheen),this.sheenColor&&this.sheenColor.isColor&&(n.sheenColor=this.sheenColor.getHex()),this.sheenRoughness!==void 0&&(n.sheenRoughness=this.sheenRoughness),this.emissive&&this.emissive.isColor&&(n.emissive=this.emissive.getHex()),this.emissiveIntensity!==void 0&&this.emissiveIntensity!==1&&(n.emissiveIntensity=this.emissiveIntensity),this.specular&&this.specular.isColor&&(n.specular=this.specular.getHex()),this.specularIntensity!==void 0&&(n.specularIntensity=this.specularIntensity),this.specularColor&&this.specularColor.isColor&&(n.specularColor=this.specularColor.getHex()),this.shininess!==void 0&&(n.shininess=this.shininess),this.clearcoat!==void 0&&(n.clearcoat=this.clearcoat),this.clearcoatRoughness!==void 0&&(n.clearcoatRoughness=this.clearcoatRoughness),this.clearcoatMap&&this.clearcoatMap.isTexture&&(n.clearcoatMap=this.clearcoatMap.toJSON(t).uuid),this.clearcoatRoughnessMap&&this.clearcoatRoughnessMap.isTexture&&(n.clearcoatRoughnessMap=this.clearcoatRoughnessMap.toJSON(t).uuid),this.clearcoatNormalMap&&this.clearcoatNormalMap.isTexture&&(n.clearcoatNormalMap=this.clearcoatNormalMap.toJSON(t).uuid,n.clearcoatNormalScale=this.clearcoatNormalScale.toArray()),this.sheenColorMap&&this.sheenColorMap.isTexture&&(n.sheenColorMap=this.sheenColorMap.toJSON(t).uuid),this.sheenRoughnessMap&&this.sheenRoughnessMap.isTexture&&(n.sheenRoughnessMap=this.sheenRoughnessMap.toJSON(t).uuid),this.dispersion!==void 0&&(n.dispersion=this.dispersion),this.iridescence!==void 0&&(n.iridescence=this.iridescence),this.iridescenceIOR!==void 0&&(n.iridescenceIOR=this.iridescenceIOR),this.iridescenceThicknessRange!==void 0&&(n.iridescenceThicknessRange=this.iridescenceThicknessRange),this.iridescenceMap&&this.iridescenceMap.isTexture&&(n.iridescenceMap=this.iridescenceMap.toJSON(t).uuid),this.iridescenceThicknessMap&&this.iridescenceThicknessMap.isTexture&&(n.iridescenceThicknessMap=this.iridescenceThicknessMap.toJSON(t).uuid),this.anisotropy!==void 0&&(n.anisotropy=this.anisotropy),this.anisotropyRotation!==void 0&&(n.anisotropyRotation=this.anisotropyRotation),this.anisotropyMap&&this.anisotropyMap.isTexture&&(n.anisotropyMap=this.anisotropyMap.toJSON(t).uuid),this.map&&this.map.isTexture&&(n.map=this.map.toJSON(t).uuid),this.matcap&&this.matcap.isTexture&&(n.matcap=this.matcap.toJSON(t).uuid),this.alphaMap&&this.alphaMap.isTexture&&(n.alphaMap=this.alphaMap.toJSON(t).uuid),this.lightMap&&this.lightMap.isTexture&&(n.lightMap=this.lightMap.toJSON(t).uuid,n.lightMapIntensity=this.lightMapIntensity),this.aoMap&&this.aoMap.isTexture&&(n.aoMap=this.aoMap.toJSON(t).uuid,n.aoMapIntensity=this.aoMapIntensity),this.bumpMap&&this.bumpMap.isTexture&&(n.bumpMap=this.bumpMap.toJSON(t).uuid,n.bumpScale=this.bumpScale),this.normalMap&&this.normalMap.isTexture&&(n.normalMap=this.normalMap.toJSON(t).uuid,n.normalMapType=this.normalMapType,n.normalScale=this.normalScale.toArray()),this.displacementMap&&this.displacementMap.isTexture&&(n.displacementMap=this.displacementMap.toJSON(t).uuid,n.displacementScale=this.displacementScale,n.displacementBias=this.displacementBias),this.roughnessMap&&this.roughnessMap.isTexture&&(n.roughnessMap=this.roughnessMap.toJSON(t).uuid),this.metalnessMap&&this.metalnessMap.isTexture&&(n.metalnessMap=this.metalnessMap.toJSON(t).uuid),this.emissiveMap&&this.emissiveMap.isTexture&&(n.emissiveMap=this.emissiveMap.toJSON(t).uuid),this.specularMap&&this.specularMap.isTexture&&(n.specularMap=this.specularMap.toJSON(t).uuid),this.specularIntensityMap&&this.specularIntensityMap.isTexture&&(n.specularIntensityMap=this.specularIntensityMap.toJSON(t).uuid),this.specularColorMap&&this.specularColorMap.isTexture&&(n.specularColorMap=this.specularColorMap.toJSON(t).uuid),this.envMap&&this.envMap.isTexture&&(n.envMap=this.envMap.toJSON(t).uuid,this.combine!==void 0&&(n.combine=this.combine)),this.envMapRotation!==void 0&&(n.envMapRotation=this.envMapRotation.toArray()),this.envMapIntensity!==void 0&&(n.envMapIntensity=this.envMapIntensity),this.reflectivity!==void 0&&(n.reflectivity=this.reflectivity),this.refractionRatio!==void 0&&(n.refractionRatio=this.refractionRatio),this.gradientMap&&this.gradientMap.isTexture&&(n.gradientMap=this.gradientMap.toJSON(t).uuid),this.transmission!==void 0&&(n.transmission=this.transmission),this.transmissionMap&&this.transmissionMap.isTexture&&(n.transmissionMap=this.transmissionMap.toJSON(t).uuid),this.thickness!==void 0&&(n.thickness=this.thickness),this.thicknessMap&&this.thicknessMap.isTexture&&(n.thicknessMap=this.thicknessMap.toJSON(t).uuid),this.attenuationDistance!==void 0&&this.attenuationDistance!==1/0&&(n.attenuationDistance=this.attenuationDistance),this.attenuationColor!==void 0&&(n.attenuationColor=this.attenuationColor.getHex()),this.size!==void 0&&(n.size=this.size),this.shadowSide!==null&&(n.shadowSide=this.shadowSide),this.sizeAttenuation!==void 0&&(n.sizeAttenuation=this.sizeAttenuation),this.blending!==vi&&(n.blending=this.blending),this.side!==Bn&&(n.side=this.side),this.vertexColors===!0&&(n.vertexColors=!0),this.opacity<1&&(n.opacity=this.opacity),this.transparent===!0&&(n.transparent=!0),this.blendSrc!==Wr&&(n.blendSrc=this.blendSrc),this.blendDst!==Xr&&(n.blendDst=this.blendDst),this.blendEquation!==ni&&(n.blendEquation=this.blendEquation),this.blendSrcAlpha!==null&&(n.blendSrcAlpha=this.blendSrcAlpha),this.blendDstAlpha!==null&&(n.blendDstAlpha=this.blendDstAlpha),this.blendEquationAlpha!==null&&(n.blendEquationAlpha=this.blendEquationAlpha),this.blendColor&&this.blendColor.isColor&&(n.blendColor=this.blendColor.getHex()),this.blendAlpha!==0&&(n.blendAlpha=this.blendAlpha),this.depthFunc!==bi&&(n.depthFunc=this.depthFunc),this.depthTest===!1&&(n.depthTest=this.depthTest),this.depthWrite===!1&&(n.depthWrite=this.depthWrite),this.colorWrite===!1&&(n.colorWrite=this.colorWrite),this.stencilWriteMask!==255&&(n.stencilWriteMask=this.stencilWriteMask),this.stencilFunc!==cl&&(n.stencilFunc=this.stencilFunc),this.stencilRef!==0&&(n.stencilRef=this.stencilRef),this.stencilFuncMask!==255&&(n.stencilFuncMask=this.stencilFuncMask),this.stencilFail!==yi&&(n.stencilFail=this.stencilFail),this.stencilZFail!==yi&&(n.stencilZFail=this.stencilZFail),this.stencilZPass!==yi&&(n.stencilZPass=this.stencilZPass),this.stencilWrite===!0&&(n.stencilWrite=this.stencilWrite),this.rotation!==void 0&&this.rotation!==0&&(n.rotation=this.rotation),this.polygonOffset===!0&&(n.polygonOffset=!0),this.polygonOffsetFactor!==0&&(n.polygonOffsetFactor=this.polygonOffsetFactor),this.polygonOffsetUnits!==0&&(n.polygonOffsetUnits=this.polygonOffsetUnits),this.linewidth!==void 0&&this.linewidth!==1&&(n.linewidth=this.linewidth),this.dashSize!==void 0&&(n.dashSize=this.dashSize),this.gapSize!==void 0&&(n.gapSize=this.gapSize),this.scale!==void 0&&(n.scale=this.scale),this.dithering===!0&&(n.dithering=!0),this.alphaTest>0&&(n.alphaTest=this.alphaTest),this.alphaHash===!0&&(n.alphaHash=!0),this.alphaToCoverage===!0&&(n.alphaToCoverage=!0),this.premultipliedAlpha===!0&&(n.premultipliedAlpha=!0),this.forceSinglePass===!0&&(n.forceSinglePass=!0),this.wireframe===!0&&(n.wireframe=!0),this.wireframeLinewidth>1&&(n.wireframeLinewidth=this.wireframeLinewidth),this.wireframeLinecap!=="round"&&(n.wireframeLinecap=this.wireframeLinecap),this.wireframeLinejoin!=="round"&&(n.wireframeLinejoin=this.wireframeLinejoin),this.flatShading===!0&&(n.flatShading=!0),this.visible===!1&&(n.visible=!1),this.toneMapped===!1&&(n.toneMapped=!1),this.fog===!1&&(n.fog=!1),Object.keys(this.userData).length>0&&(n.userData=this.userData);function s(r){let a=[];for(let o in r){let l=r[o];delete l.metadata,a.push(l)}return a}if(e){let r=s(t.textures),a=s(t.images);r.length>0&&(n.textures=r),a.length>0&&(n.images=a)}return n}clone(){return new this.constructor().copy(this)}copy(t){this.name=t.name,this.blending=t.blending,this.side=t.side,this.vertexColors=t.vertexColors,this.opacity=t.opacity,this.transparent=t.transparent,this.blendSrc=t.blendSrc,this.blendDst=t.blendDst,this.blendEquation=t.blendEquation,this.blendSrcAlpha=t.blendSrcAlpha,this.blendDstAlpha=t.blendDstAlpha,this.blendEquationAlpha=t.blendEquationAlpha,this.blendColor.copy(t.blendColor),this.blendAlpha=t.blendAlpha,this.depthFunc=t.depthFunc,this.depthTest=t.depthTest,this.depthWrite=t.depthWrite,this.stencilWriteMask=t.stencilWriteMask,this.stencilFunc=t.stencilFunc,this.stencilRef=t.stencilRef,this.stencilFuncMask=t.stencilFuncMask,this.stencilFail=t.stencilFail,this.stencilZFail=t.stencilZFail,this.stencilZPass=t.stencilZPass,this.stencilWrite=t.stencilWrite;let e=t.clippingPlanes,n=null;if(e!==null){let s=e.length;n=new Array(s);for(let r=0;r!==s;++r)n[r]=e[r].clone()}return this.clippingPlanes=n,this.clipIntersection=t.clipIntersection,this.clipShadows=t.clipShadows,this.shadowSide=t.shadowSide,this.colorWrite=t.colorWrite,this.precision=t.precision,this.polygonOffset=t.polygonOffset,this.polygonOffsetFactor=t.polygonOffsetFactor,this.polygonOffsetUnits=t.polygonOffsetUnits,this.dithering=t.dithering,this.alphaTest=t.alphaTest,this.alphaHash=t.alphaHash,this.alphaToCoverage=t.alphaToCoverage,this.premultipliedAlpha=t.premultipliedAlpha,this.forceSinglePass=t.forceSinglePass,this.visible=t.visible,this.toneMapped=t.toneMapped,this.userData=JSON.parse(JSON.stringify(t.userData)),this}dispose(){this.dispatchEvent({type:"dispose"})}set needsUpdate(t){t===!0&&this.version++}},Si=class extends kn{constructor(t){super(),this.isMeshBasicMaterial=!0,this.type="MeshBasicMaterial",this.color=new kt(16777215),this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.specularMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.combine=vl,this.reflectivity=1,this.refractionRatio=.98,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.specularMap=t.specularMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.combine=t.combine,this.reflectivity=t.reflectivity,this.refractionRatio=t.refractionRatio,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.fog=t.fog,this}};var fe=new L,Pr=new Dt,Pu=0,we=class{constructor(t,e,n=!1){if(Array.isArray(t))throw new TypeError("THREE.BufferAttribute: array should be a Typed Array.");this.isBufferAttribute=!0,Object.defineProperty(this,"id",{value:Pu++}),this.name="",this.array=t,this.itemSize=e,this.count=t!==void 0?t.length/e:0,this.normalized=n,this.usage=hl,this.updateRanges=[],this.gpuType=yn,this.version=0}onUploadCallback(){}set needsUpdate(t){t===!0&&this.version++}setUsage(t){return this.usage=t,this}addUpdateRange(t,e){this.updateRanges.push({start:t,count:e})}clearUpdateRanges(){this.updateRanges.length=0}copy(t){return this.name=t.name,this.array=new t.array.constructor(t.array),this.itemSize=t.itemSize,this.count=t.count,this.normalized=t.normalized,this.usage=t.usage,this.gpuType=t.gpuType,this}copyAt(t,e,n){t*=this.itemSize,n*=e.itemSize;for(let s=0,r=this.itemSize;s<r;s++)this.array[t+s]=e.array[n+s];return this}copyArray(t){return this.array.set(t),this}applyMatrix3(t){if(this.itemSize===2)for(let e=0,n=this.count;e<n;e++)Pr.fromBufferAttribute(this,e),Pr.applyMatrix3(t),this.setXY(e,Pr.x,Pr.y);else if(this.itemSize===3)for(let e=0,n=this.count;e<n;e++)fe.fromBufferAttribute(this,e),fe.applyMatrix3(t),this.setXYZ(e,fe.x,fe.y,fe.z);return this}applyMatrix4(t){for(let e=0,n=this.count;e<n;e++)fe.fromBufferAttribute(this,e),fe.applyMatrix4(t),this.setXYZ(e,fe.x,fe.y,fe.z);return this}applyNormalMatrix(t){for(let e=0,n=this.count;e<n;e++)fe.fromBufferAttribute(this,e),fe.applyNormalMatrix(t),this.setXYZ(e,fe.x,fe.y,fe.z);return this}transformDirection(t){for(let e=0,n=this.count;e<n;e++)fe.fromBufferAttribute(this,e),fe.transformDirection(t),this.setXYZ(e,fe.x,fe.y,fe.z);return this}set(t,e=0){return this.array.set(t,e),this}getComponent(t,e){let n=this.array[t*this.itemSize+e];return this.normalized&&(n=ji(n,this.array)),n}setComponent(t,e,n){return this.normalized&&(n=Be(n,this.array)),this.array[t*this.itemSize+e]=n,this}getX(t){let e=this.array[t*this.itemSize];return this.normalized&&(e=ji(e,this.array)),e}setX(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize]=e,this}getY(t){let e=this.array[t*this.itemSize+1];return this.normalized&&(e=ji(e,this.array)),e}setY(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+1]=e,this}getZ(t){let e=this.array[t*this.itemSize+2];return this.normalized&&(e=ji(e,this.array)),e}setZ(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+2]=e,this}getW(t){let e=this.array[t*this.itemSize+3];return this.normalized&&(e=ji(e,this.array)),e}setW(t,e){return this.normalized&&(e=Be(e,this.array)),this.array[t*this.itemSize+3]=e,this}setXY(t,e,n){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array)),this.array[t+0]=e,this.array[t+1]=n,this}setXYZ(t,e,n,s){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array),s=Be(s,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this}setXYZW(t,e,n,s,r){return t*=this.itemSize,this.normalized&&(e=Be(e,this.array),n=Be(n,this.array),s=Be(s,this.array),r=Be(r,this.array)),this.array[t+0]=e,this.array[t+1]=n,this.array[t+2]=s,this.array[t+3]=r,this}onUpload(t){return this.onUploadCallback=t,this}clone(){return new this.constructor(this.array,this.itemSize).copy(this)}toJSON(){let t={itemSize:this.itemSize,type:this.array.constructor.name,array:Array.from(this.array),normalized:this.normalized};return this.name!==""&&(t.name=this.name),this.usage!==hl&&(t.usage=this.usage),t}};var ks=class extends we{constructor(t,e,n){super(new Uint16Array(t),e,n)}};var Vs=class extends we{constructor(t,e,n){super(new Uint32Array(t),e,n)}};var Ge=class extends we{constructor(t,e,n){super(new Float32Array(t),e,n)}},Iu=0,rn=new Jt,el=new Ee,Yi=new L,Qe=new tn,Rs=new tn,Me=new L,$e=class i extends wn{constructor(){super(),this.isBufferGeometry=!0,Object.defineProperty(this,"id",{value:Iu++}),this.uuid=ps(),this.name="",this.type="BufferGeometry",this.index=null,this.indirect=null,this.attributes={},this.morphAttributes={},this.morphTargetsRelative=!1,this.groups=[],this.boundingBox=null,this.boundingSphere=null,this.drawRange={start:0,count:1/0},this.userData={}}getIndex(){return this.index}setIndex(t){return Array.isArray(t)?this.index=new(Nl(t)?Vs:ks)(t,1):this.index=t,this}setIndirect(t){return this.indirect=t,this}getIndirect(){return this.indirect}getAttribute(t){return this.attributes[t]}setAttribute(t,e){return this.attributes[t]=e,this}deleteAttribute(t){return delete this.attributes[t],this}hasAttribute(t){return this.attributes[t]!==void 0}addGroup(t,e,n=0){this.groups.push({start:t,count:e,materialIndex:n})}clearGroups(){this.groups=[]}setDrawRange(t,e){this.drawRange.start=t,this.drawRange.count=e}applyMatrix4(t){let e=this.attributes.position;e!==void 0&&(e.applyMatrix4(t),e.needsUpdate=!0);let n=this.attributes.normal;if(n!==void 0){let r=new Ot().getNormalMatrix(t);n.applyNormalMatrix(r),n.needsUpdate=!0}let s=this.attributes.tangent;return s!==void 0&&(s.transformDirection(t),s.needsUpdate=!0),this.boundingBox!==null&&this.computeBoundingBox(),this.boundingSphere!==null&&this.computeBoundingSphere(),this}applyQuaternion(t){return rn.makeRotationFromQuaternion(t),this.applyMatrix4(rn),this}rotateX(t){return rn.makeRotationX(t),this.applyMatrix4(rn),this}rotateY(t){return rn.makeRotationY(t),this.applyMatrix4(rn),this}rotateZ(t){return rn.makeRotationZ(t),this.applyMatrix4(rn),this}translate(t,e,n){return rn.makeTranslation(t,e,n),this.applyMatrix4(rn),this}scale(t,e,n){return rn.makeScale(t,e,n),this.applyMatrix4(rn),this}lookAt(t){return el.lookAt(t),el.updateMatrix(),this.applyMatrix4(el.matrix),this}center(){return this.computeBoundingBox(),this.boundingBox.getCenter(Yi).negate(),this.translate(Yi.x,Yi.y,Yi.z),this}setFromPoints(t){let e=this.getAttribute("position");if(e===void 0){let n=[];for(let s=0,r=t.length;s<r;s++){let a=t[s];n.push(a.x,a.y,a.z||0)}this.setAttribute("position",new Ge(n,3))}else{let n=Math.min(t.length,e.count);for(let s=0;s<n;s++){let r=t[s];e.setXYZ(s,r.x,r.y,r.z||0)}t.length>e.count&&console.warn("THREE.BufferGeometry: Buffer size too small for points data. Use .dispose() and create a new geometry."),e.needsUpdate=!0}return this}computeBoundingBox(){this.boundingBox===null&&(this.boundingBox=new tn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingBox(): GLBufferAttribute requires a manual bounding box.",this),this.boundingBox.set(new L(-1/0,-1/0,-1/0),new L(1/0,1/0,1/0));return}if(t!==void 0){if(this.boundingBox.setFromBufferAttribute(t),e)for(let n=0,s=e.length;n<s;n++){let r=e[n];Qe.setFromBufferAttribute(r),this.morphTargetsRelative?(Me.addVectors(this.boundingBox.min,Qe.min),this.boundingBox.expandByPoint(Me),Me.addVectors(this.boundingBox.max,Qe.max),this.boundingBox.expandByPoint(Me)):(this.boundingBox.expandByPoint(Qe.min),this.boundingBox.expandByPoint(Qe.max))}}else this.boundingBox.makeEmpty();(isNaN(this.boundingBox.min.x)||isNaN(this.boundingBox.min.y)||isNaN(this.boundingBox.min.z))&&console.error('THREE.BufferGeometry.computeBoundingBox(): Computed min/max have NaN values. The "position" attribute is likely to have NaN values.',this)}computeBoundingSphere(){this.boundingSphere===null&&(this.boundingSphere=new zn);let t=this.attributes.position,e=this.morphAttributes.position;if(t&&t.isGLBufferAttribute){console.error("THREE.BufferGeometry.computeBoundingSphere(): GLBufferAttribute requires a manual bounding sphere.",this),this.boundingSphere.set(new L,1/0);return}if(t){let n=this.boundingSphere.center;if(Qe.setFromBufferAttribute(t),e)for(let r=0,a=e.length;r<a;r++){let o=e[r];Rs.setFromBufferAttribute(o),this.morphTargetsRelative?(Me.addVectors(Qe.min,Rs.min),Qe.expandByPoint(Me),Me.addVectors(Qe.max,Rs.max),Qe.expandByPoint(Me)):(Qe.expandByPoint(Rs.min),Qe.expandByPoint(Rs.max))}Qe.getCenter(n);let s=0;for(let r=0,a=t.count;r<a;r++)Me.fromBufferAttribute(t,r),s=Math.max(s,n.distanceToSquared(Me));if(e)for(let r=0,a=e.length;r<a;r++){let o=e[r],l=this.morphTargetsRelative;for(let c=0,u=o.count;c<u;c++)Me.fromBufferAttribute(o,c),l&&(Yi.fromBufferAttribute(t,c),Me.add(Yi)),s=Math.max(s,n.distanceToSquared(Me))}this.boundingSphere.radius=Math.sqrt(s),isNaN(this.boundingSphere.radius)&&console.error('THREE.BufferGeometry.computeBoundingSphere(): Computed radius is NaN. The "position" attribute is likely to have NaN values.',this)}}computeTangents(){let t=this.index,e=this.attributes;if(t===null||e.position===void 0||e.normal===void 0||e.uv===void 0){console.error("THREE.BufferGeometry: .computeTangents() failed. Missing required attributes (index, position, normal or uv)");return}let n=e.position,s=e.normal,r=e.uv;this.hasAttribute("tangent")===!1&&this.setAttribute("tangent",new we(new Float32Array(4*n.count),4));let a=this.getAttribute("tangent"),o=[],l=[];for(let B=0;B<n.count;B++)o[B]=new L,l[B]=new L;let c=new L,u=new L,d=new L,h=new Dt,f=new Dt,_=new Dt,y=new L,m=new L;function p(B,b,v){c.fromBufferAttribute(n,B),u.fromBufferAttribute(n,b),d.fromBufferAttribute(n,v),h.fromBufferAttribute(r,B),f.fromBufferAttribute(r,b),_.fromBufferAttribute(r,v),u.sub(c),d.sub(c),f.sub(h),_.sub(h);let D=1/(f.x*_.y-_.x*f.y);isFinite(D)&&(y.copy(u).multiplyScalar(_.y).addScaledVector(d,-f.y).multiplyScalar(D),m.copy(d).multiplyScalar(f.x).addScaledVector(u,-_.x).multiplyScalar(D),o[B].add(y),o[b].add(y),o[v].add(y),l[B].add(m),l[b].add(m),l[v].add(m))}let w=this.groups;w.length===0&&(w=[{start:0,count:t.count}]);for(let B=0,b=w.length;B<b;++B){let v=w[B],D=v.start,V=v.count;for(let W=D,q=D+V;W<q;W+=3)p(t.getX(W+0),t.getX(W+1),t.getX(W+2))}let E=new L,M=new L,P=new L,R=new L;function C(B){P.fromBufferAttribute(s,B),R.copy(P);let b=o[B];E.copy(b),E.sub(P.multiplyScalar(P.dot(b))).normalize(),M.crossVectors(R,b);let D=M.dot(l[B])<0?-1:1;a.setXYZW(B,E.x,E.y,E.z,D)}for(let B=0,b=w.length;B<b;++B){let v=w[B],D=v.start,V=v.count;for(let W=D,q=D+V;W<q;W+=3)C(t.getX(W+0)),C(t.getX(W+1)),C(t.getX(W+2))}}computeVertexNormals(){let t=this.index,e=this.getAttribute("position");if(e!==void 0){let n=this.getAttribute("normal");if(n===void 0)n=new we(new Float32Array(e.count*3),3),this.setAttribute("normal",n);else for(let h=0,f=n.count;h<f;h++)n.setXYZ(h,0,0,0);let s=new L,r=new L,a=new L,o=new L,l=new L,c=new L,u=new L,d=new L;if(t)for(let h=0,f=t.count;h<f;h+=3){let _=t.getX(h+0),y=t.getX(h+1),m=t.getX(h+2);s.fromBufferAttribute(e,_),r.fromBufferAttribute(e,y),a.fromBufferAttribute(e,m),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),o.fromBufferAttribute(n,_),l.fromBufferAttribute(n,y),c.fromBufferAttribute(n,m),o.add(u),l.add(u),c.add(u),n.setXYZ(_,o.x,o.y,o.z),n.setXYZ(y,l.x,l.y,l.z),n.setXYZ(m,c.x,c.y,c.z)}else for(let h=0,f=e.count;h<f;h+=3)s.fromBufferAttribute(e,h+0),r.fromBufferAttribute(e,h+1),a.fromBufferAttribute(e,h+2),u.subVectors(a,r),d.subVectors(s,r),u.cross(d),n.setXYZ(h+0,u.x,u.y,u.z),n.setXYZ(h+1,u.x,u.y,u.z),n.setXYZ(h+2,u.x,u.y,u.z);this.normalizeNormals(),n.needsUpdate=!0}}normalizeNormals(){let t=this.attributes.normal;for(let e=0,n=t.count;e<n;e++)Me.fromBufferAttribute(t,e),Me.normalize(),t.setXYZ(e,Me.x,Me.y,Me.z)}toNonIndexed(){function t(o,l){let c=o.array,u=o.itemSize,d=o.normalized,h=new c.constructor(l.length*u),f=0,_=0;for(let y=0,m=l.length;y<m;y++){o.isInterleavedBufferAttribute?f=l[y]*o.data.stride+o.offset:f=l[y]*u;for(let p=0;p<u;p++)h[_++]=c[f++]}return new we(h,u,d)}if(this.index===null)return console.warn("THREE.BufferGeometry.toNonIndexed(): BufferGeometry is already non-indexed."),this;let e=new i,n=this.index.array,s=this.attributes;for(let o in s){let l=s[o],c=t(l,n);e.setAttribute(o,c)}let r=this.morphAttributes;for(let o in r){let l=[],c=r[o];for(let u=0,d=c.length;u<d;u++){let h=c[u],f=t(h,n);l.push(f)}e.morphAttributes[o]=l}e.morphTargetsRelative=this.morphTargetsRelative;let a=this.groups;for(let o=0,l=a.length;o<l;o++){let c=a[o];e.addGroup(c.start,c.count,c.materialIndex)}return e}toJSON(){let t={metadata:{version:4.7,type:"BufferGeometry",generator:"BufferGeometry.toJSON"}};if(t.uuid=this.uuid,t.type=this.type,this.name!==""&&(t.name=this.name),Object.keys(this.userData).length>0&&(t.userData=this.userData),this.parameters!==void 0){let l=this.parameters;for(let c in l)l[c]!==void 0&&(t[c]=l[c]);return t}t.data={attributes:{}};let e=this.index;e!==null&&(t.data.index={type:e.array.constructor.name,array:Array.prototype.slice.call(e.array)});let n=this.attributes;for(let l in n){let c=n[l];t.data.attributes[l]=c.toJSON(t.data)}let s={},r=!1;for(let l in this.morphAttributes){let c=this.morphAttributes[l],u=[];for(let d=0,h=c.length;d<h;d++){let f=c[d];u.push(f.toJSON(t.data))}u.length>0&&(s[l]=u,r=!0)}r&&(t.data.morphAttributes=s,t.data.morphTargetsRelative=this.morphTargetsRelative);let a=this.groups;a.length>0&&(t.data.groups=JSON.parse(JSON.stringify(a)));let o=this.boundingSphere;return o!==null&&(t.data.boundingSphere=o.toJSON()),t}clone(){return new this.constructor().copy(this)}copy(t){this.index=null,this.attributes={},this.morphAttributes={},this.groups=[],this.boundingBox=null,this.boundingSphere=null;let e={};this.name=t.name;let n=t.index;n!==null&&this.setIndex(n.clone());let s=t.attributes;for(let c in s){let u=s[c];this.setAttribute(c,u.clone(e))}let r=t.morphAttributes;for(let c in r){let u=[],d=r[c];for(let h=0,f=d.length;h<f;h++)u.push(d[h].clone(e));this.morphAttributes[c]=u}this.morphTargetsRelative=t.morphTargetsRelative;let a=t.groups;for(let c=0,u=a.length;c<u;c++){let d=a[c];this.addGroup(d.start,d.count,d.materialIndex)}let o=t.boundingBox;o!==null&&(this.boundingBox=o.clone());let l=t.boundingSphere;return l!==null&&(this.boundingSphere=l.clone()),this.drawRange.start=t.drawRange.start,this.drawRange.count=t.drawRange.count,this.userData=t.userData,this}dispose(){this.dispatchEvent({type:"dispose"})}},Xc=new Jt,_i=new ii,Ir=new zn,$c=new L,Lr=new L,Dr=new L,Nr=new L,nl=new L,Ur=new L,qc=new L,Fr=new L,Te=class extends Ee{constructor(t=new $e,e=new Si){super(),this.isMesh=!0,this.type="Mesh",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.count=1,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),t.morphTargetInfluences!==void 0&&(this.morphTargetInfluences=t.morphTargetInfluences.slice()),t.morphTargetDictionary!==void 0&&(this.morphTargetDictionary=Object.assign({},t.morphTargetDictionary)),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}getVertexPosition(t,e){let n=this.geometry,s=n.attributes.position,r=n.morphAttributes.position,a=n.morphTargetsRelative;e.fromBufferAttribute(s,t);let o=this.morphTargetInfluences;if(r&&o){Ur.set(0,0,0);for(let l=0,c=r.length;l<c;l++){let u=o[l],d=r[l];u!==0&&(nl.fromBufferAttribute(d,t),a?Ur.addScaledVector(nl,u):Ur.addScaledVector(nl.sub(e),u))}e.add(Ur)}return e}raycast(t,e){let n=this.geometry,s=this.material,r=this.matrixWorld;s!==void 0&&(n.boundingSphere===null&&n.computeBoundingSphere(),Ir.copy(n.boundingSphere),Ir.applyMatrix4(r),_i.copy(t.ray).recast(t.near),!(Ir.containsPoint(_i.origin)===!1&&(_i.intersectSphere(Ir,$c)===null||_i.origin.distanceToSquared($c)>(t.far-t.near)**2))&&(Xc.copy(r).invert(),_i.copy(t.ray).applyMatrix4(Xc),!(n.boundingBox!==null&&_i.intersectsBox(n.boundingBox)===!1)&&this._computeIntersections(t,e,_i)))}_computeIntersections(t,e,n){let s,r=this.geometry,a=this.material,o=r.index,l=r.attributes.position,c=r.attributes.uv,u=r.attributes.uv1,d=r.attributes.normal,h=r.groups,f=r.drawRange;if(o!==null)if(Array.isArray(a))for(let _=0,y=h.length;_<y;_++){let m=h[_],p=a[m.materialIndex],w=Math.max(m.start,f.start),E=Math.min(o.count,Math.min(m.start+m.count,f.start+f.count));for(let M=w,P=E;M<P;M+=3){let R=o.getX(M),C=o.getX(M+1),B=o.getX(M+2);s=Or(this,p,t,n,c,u,d,R,C,B),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let _=Math.max(0,f.start),y=Math.min(o.count,f.start+f.count);for(let m=_,p=y;m<p;m+=3){let w=o.getX(m),E=o.getX(m+1),M=o.getX(m+2);s=Or(this,a,t,n,c,u,d,w,E,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}else if(l!==void 0)if(Array.isArray(a))for(let _=0,y=h.length;_<y;_++){let m=h[_],p=a[m.materialIndex],w=Math.max(m.start,f.start),E=Math.min(l.count,Math.min(m.start+m.count,f.start+f.count));for(let M=w,P=E;M<P;M+=3){let R=M,C=M+1,B=M+2;s=Or(this,p,t,n,c,u,d,R,C,B),s&&(s.faceIndex=Math.floor(M/3),s.face.materialIndex=m.materialIndex,e.push(s))}}else{let _=Math.max(0,f.start),y=Math.min(l.count,f.start+f.count);for(let m=_,p=y;m<p;m+=3){let w=m,E=m+1,M=m+2;s=Or(this,a,t,n,c,u,d,w,E,M),s&&(s.faceIndex=Math.floor(m/3),e.push(s))}}}};function Lu(i,t,e,n,s,r,a,o){let l;if(t.side===ke?l=n.intersectTriangle(a,r,s,!0,o):l=n.intersectTriangle(s,r,a,t.side===Bn,o),l===null)return null;Fr.copy(o),Fr.applyMatrix4(i.matrixWorld);let c=e.ray.origin.distanceTo(Fr);return c<e.near||c>e.far?null:{distance:c,point:Fr.clone(),object:i}}function Or(i,t,e,n,s,r,a,o,l,c){i.getVertexPosition(o,Lr),i.getVertexPosition(l,Dr),i.getVertexPosition(c,Nr);let u=Lu(i,t,e,n,Lr,Dr,Nr,qc);if(u){let d=new L;ti.getBarycoord(qc,Lr,Dr,Nr,d),s&&(u.uv=ti.getInterpolatedAttribute(s,o,l,c,d,new Dt)),r&&(u.uv1=ti.getInterpolatedAttribute(r,o,l,c,d,new Dt)),a&&(u.normal=ti.getInterpolatedAttribute(a,o,l,c,d,new L),u.normal.dot(n.direction)>0&&u.normal.multiplyScalar(-1));let h={a:o,b:l,c,normal:new L,materialIndex:0};ti.getNormal(Lr,Dr,Nr,h.normal),u.face=h,u.barycoord=d}return u}var rs=class i extends $e{constructor(t=1,e=1,n=1,s=1,r=1,a=1){super(),this.type="BoxGeometry",this.parameters={width:t,height:e,depth:n,widthSegments:s,heightSegments:r,depthSegments:a};let o=this;s=Math.floor(s),r=Math.floor(r),a=Math.floor(a);let l=[],c=[],u=[],d=[],h=0,f=0;_("z","y","x",-1,-1,n,e,t,a,r,0),_("z","y","x",1,-1,n,e,-t,a,r,1),_("x","z","y",1,1,t,n,e,s,a,2),_("x","z","y",1,-1,t,n,-e,s,a,3),_("x","y","z",1,-1,t,e,n,s,r,4),_("x","y","z",-1,-1,t,e,-n,s,r,5),this.setIndex(l),this.setAttribute("position",new Ge(c,3)),this.setAttribute("normal",new Ge(u,3)),this.setAttribute("uv",new Ge(d,2));function _(y,m,p,w,E,M,P,R,C,B,b){let v=M/C,D=P/B,V=M/2,W=P/2,q=R/2,J=C+1,$=B+1,st=0,H=0,lt=new L;for(let pt=0;pt<$;pt++){let Tt=pt*D-W;for(let Gt=0;Gt<J;Gt++){let ee=Gt*v-V;lt[y]=ee*w,lt[m]=Tt*E,lt[p]=q,c.push(lt.x,lt.y,lt.z),lt[y]=0,lt[m]=0,lt[p]=R>0?1:-1,u.push(lt.x,lt.y,lt.z),d.push(Gt/C),d.push(1-pt/B),st+=1}}for(let pt=0;pt<B;pt++)for(let Tt=0;Tt<C;Tt++){let Gt=h+Tt+J*pt,ee=h+Tt+J*(pt+1),re=h+(Tt+1)+J*(pt+1),Yt=h+(Tt+1)+J*pt;l.push(Gt,ee,Yt),l.push(ee,re,Yt),H+=6}o.addGroup(f,H,b),f+=H,h+=st}}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.depth,t.widthSegments,t.heightSegments,t.depthSegments)}};function Ri(i){let t={};for(let e in i){t[e]={};for(let n in i[e]){let s=i[e][n];s&&(s.isColor||s.isMatrix3||s.isMatrix4||s.isVector2||s.isVector3||s.isVector4||s.isTexture||s.isQuaternion)?s.isRenderTargetTexture?(console.warn("UniformsUtils: Textures of render targets cannot be cloned via cloneUniforms() or mergeUniforms()."),t[e][n]=null):t[e][n]=s.clone():Array.isArray(s)?t[e][n]=s.slice():t[e][n]=s}}return t}function Fe(i){let t={};for(let e=0;e<i.length;e++){let n=Ri(i[e]);for(let s in n)t[s]=n[s]}return t}function Du(i){let t=[];for(let e=0;e<i.length;e++)t.push(i[e].clone());return t}function Ul(i){let t=i.getRenderTarget();return t===null?i.outputColorSpace:t.isXRRenderTarget===!0?t.texture.colorSpace:$t.workingColorSpace}var Yh={clone:Ri,merge:Fe},Nu=`void main() {
	gl_Position = projectionMatrix * modelViewMatrix * vec4( position, 1.0 );
}`,Uu=`void main() {
	gl_FragColor = vec4( 1.0, 0.0, 0.0, 1.0 );
}`,_n=class extends kn{constructor(t){super(),this.isShaderMaterial=!0,this.type="ShaderMaterial",this.defines={},this.uniforms={},this.uniformsGroups=[],this.vertexShader=Nu,this.fragmentShader=Uu,this.linewidth=1,this.wireframe=!1,this.wireframeLinewidth=1,this.fog=!1,this.lights=!1,this.clipping=!1,this.forceSinglePass=!0,this.extensions={clipCullDistance:!1,multiDraw:!1},this.defaultAttributeValues={color:[1,1,1],uv:[0,0],uv1:[0,0]},this.index0AttributeName=void 0,this.uniformsNeedUpdate=!1,this.glslVersion=null,t!==void 0&&this.setValues(t)}copy(t){return super.copy(t),this.fragmentShader=t.fragmentShader,this.vertexShader=t.vertexShader,this.uniforms=Ri(t.uniforms),this.uniformsGroups=Du(t.uniformsGroups),this.defines=Object.assign({},t.defines),this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.fog=t.fog,this.lights=t.lights,this.clipping=t.clipping,this.extensions=Object.assign({},t.extensions),this.glslVersion=t.glslVersion,this}toJSON(t){let e=super.toJSON(t);e.glslVersion=this.glslVersion,e.uniforms={};for(let s in this.uniforms){let a=this.uniforms[s].value;a&&a.isTexture?e.uniforms[s]={type:"t",value:a.toJSON(t).uuid}:a&&a.isColor?e.uniforms[s]={type:"c",value:a.getHex()}:a&&a.isVector2?e.uniforms[s]={type:"v2",value:a.toArray()}:a&&a.isVector3?e.uniforms[s]={type:"v3",value:a.toArray()}:a&&a.isVector4?e.uniforms[s]={type:"v4",value:a.toArray()}:a&&a.isMatrix3?e.uniforms[s]={type:"m3",value:a.toArray()}:a&&a.isMatrix4?e.uniforms[s]={type:"m4",value:a.toArray()}:e.uniforms[s]={value:a}}Object.keys(this.defines).length>0&&(e.defines=this.defines),e.vertexShader=this.vertexShader,e.fragmentShader=this.fragmentShader,e.lights=this.lights,e.clipping=this.clipping;let n={};for(let s in this.extensions)this.extensions[s]===!0&&(n[s]=!0);return Object.keys(n).length>0&&(e.extensions=n),e}},Hs=class extends Ee{constructor(){super(),this.isCamera=!0,this.type="Camera",this.matrixWorldInverse=new Jt,this.projectionMatrix=new Jt,this.projectionMatrixInverse=new Jt,this.coordinateSystem=fn,this._reversedDepth=!1}get reversedDepth(){return this._reversedDepth}copy(t,e){return super.copy(t,e),this.matrixWorldInverse.copy(t.matrixWorldInverse),this.projectionMatrix.copy(t.projectionMatrix),this.projectionMatrixInverse.copy(t.projectionMatrixInverse),this.coordinateSystem=t.coordinateSystem,this}getWorldDirection(t){return super.getWorldDirection(t).negate()}updateMatrixWorld(t){super.updateMatrixWorld(t),this.matrixWorldInverse.copy(this.matrixWorld).invert()}updateWorldMatrix(t,e){super.updateWorldMatrix(t,e),this.matrixWorldInverse.copy(this.matrixWorld).invert()}clone(){return new this.constructor().copy(this)}},Qn=new L,Yc=new Dt,Zc=new Dt,Ne=class extends Hs{constructor(t=50,e=1,n=.1,s=2e3){super(),this.isPerspectiveCamera=!0,this.type="PerspectiveCamera",this.fov=t,this.zoom=1,this.near=n,this.far=s,this.focus=10,this.aspect=e,this.view=null,this.filmGauge=35,this.filmOffset=0,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.fov=t.fov,this.zoom=t.zoom,this.near=t.near,this.far=t.far,this.focus=t.focus,this.aspect=t.aspect,this.view=t.view===null?null:Object.assign({},t.view),this.filmGauge=t.filmGauge,this.filmOffset=t.filmOffset,this}setFocalLength(t){let e=.5*this.getFilmHeight()/t;this.fov=es*2*Math.atan(e),this.updateProjectionMatrix()}getFocalLength(){let t=Math.tan(Ds*.5*this.fov);return .5*this.getFilmHeight()/t}getEffectiveFOV(){return es*2*Math.atan(Math.tan(Ds*.5*this.fov)/this.zoom)}getFilmWidth(){return this.filmGauge*Math.min(this.aspect,1)}getFilmHeight(){return this.filmGauge/Math.max(this.aspect,1)}getViewBounds(t,e,n){Qn.set(-1,-1,.5).applyMatrix4(this.projectionMatrixInverse),e.set(Qn.x,Qn.y).multiplyScalar(-t/Qn.z),Qn.set(1,1,.5).applyMatrix4(this.projectionMatrixInverse),n.set(Qn.x,Qn.y).multiplyScalar(-t/Qn.z)}getViewSize(t,e){return this.getViewBounds(t,Yc,Zc),e.subVectors(Zc,Yc)}setViewOffset(t,e,n,s,r,a){this.aspect=t/e,this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=this.near,e=t*Math.tan(Ds*.5*this.fov)/this.zoom,n=2*e,s=this.aspect*n,r=-.5*s,a=this.view;if(this.view!==null&&this.view.enabled){let l=a.fullWidth,c=a.fullHeight;r+=a.offsetX*s/l,e-=a.offsetY*n/c,s*=a.width/l,n*=a.height/c}let o=this.filmOffset;o!==0&&(r+=t*o/this.getFilmWidth()),this.projectionMatrix.makePerspective(r,r+s,e,e-n,t,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.fov=this.fov,e.object.zoom=this.zoom,e.object.near=this.near,e.object.far=this.far,e.object.focus=this.focus,e.object.aspect=this.aspect,this.view!==null&&(e.object.view=Object.assign({},this.view)),e.object.filmGauge=this.filmGauge,e.object.filmOffset=this.filmOffset,e}},Zi=-90,Ji=1,jr=class extends Ee{constructor(t,e,n){super(),this.type="CubeCamera",this.renderTarget=n,this.coordinateSystem=null,this.activeMipmapLevel=0;let s=new Ne(Zi,Ji,t,e);s.layers=this.layers,this.add(s);let r=new Ne(Zi,Ji,t,e);r.layers=this.layers,this.add(r);let a=new Ne(Zi,Ji,t,e);a.layers=this.layers,this.add(a);let o=new Ne(Zi,Ji,t,e);o.layers=this.layers,this.add(o);let l=new Ne(Zi,Ji,t,e);l.layers=this.layers,this.add(l);let c=new Ne(Zi,Ji,t,e);c.layers=this.layers,this.add(c)}updateCoordinateSystem(){let t=this.coordinateSystem,e=this.children.concat(),[n,s,r,a,o,l]=e;for(let c of e)this.remove(c);if(t===fn)n.up.set(0,1,0),n.lookAt(1,0,0),s.up.set(0,1,0),s.lookAt(-1,0,0),r.up.set(0,0,-1),r.lookAt(0,1,0),a.up.set(0,0,1),a.lookAt(0,-1,0),o.up.set(0,1,0),o.lookAt(0,0,1),l.up.set(0,1,0),l.lookAt(0,0,-1);else if(t===Os)n.up.set(0,-1,0),n.lookAt(-1,0,0),s.up.set(0,-1,0),s.lookAt(1,0,0),r.up.set(0,0,1),r.lookAt(0,1,0),a.up.set(0,0,-1),a.lookAt(0,-1,0),o.up.set(0,-1,0),o.lookAt(0,0,1),l.up.set(0,-1,0),l.lookAt(0,0,-1);else throw new Error("THREE.CubeCamera.updateCoordinateSystem(): Invalid coordinate system: "+t);for(let c of e)this.add(c),c.updateMatrixWorld()}update(t,e){this.parent===null&&this.updateMatrixWorld();let{renderTarget:n,activeMipmapLevel:s}=this;this.coordinateSystem!==t.coordinateSystem&&(this.coordinateSystem=t.coordinateSystem,this.updateCoordinateSystem());let[r,a,o,l,c,u]=this.children,d=t.getRenderTarget(),h=t.getActiveCubeFace(),f=t.getActiveMipmapLevel(),_=t.xr.enabled;t.xr.enabled=!1;let y=n.texture.generateMipmaps;n.texture.generateMipmaps=!1,t.setRenderTarget(n,0,s),t.render(e,r),t.setRenderTarget(n,1,s),t.render(e,a),t.setRenderTarget(n,2,s),t.render(e,o),t.setRenderTarget(n,3,s),t.render(e,l),t.setRenderTarget(n,4,s),t.render(e,c),n.texture.generateMipmaps=y,t.setRenderTarget(n,5,s),t.render(e,u),t.setRenderTarget(d,h,f),t.xr.enabled=_,n.texture.needsPMREMUpdate=!0}},Gs=class extends Xe{constructor(t=[],e=Ai,n,s,r,a,o,l,c,u){super(t,e,n,s,r,a,o,l,c,u),this.isCubeTexture=!0,this.flipY=!1}get images(){return this.image}set images(t){this.image=t}},Qr=class extends En{constructor(t=1,e={}){super(t,t,e),this.isWebGLCubeRenderTarget=!0;let n={width:t,height:t,depth:1},s=[n,n,n,n,n,n];this.texture=new Gs(s),this._setTextureOptions(e),this.texture.isRenderTargetTexture=!0}fromEquirectangularTexture(t,e){this.texture.type=e.type,this.texture.colorSpace=e.colorSpace,this.texture.generateMipmaps=e.generateMipmaps,this.texture.minFilter=e.minFilter,this.texture.magFilter=e.magFilter;let n={uniforms:{tEquirect:{value:null}},vertexShader:`

				varying vec3 vWorldDirection;

				vec3 transformDirection( in vec3 dir, in mat4 matrix ) {

					return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );

				}

				void main() {

					vWorldDirection = transformDirection( position, modelMatrix );

					#include <begin_vertex>
					#include <project_vertex>

				}
			`,fragmentShader:`

				uniform sampler2D tEquirect;

				varying vec3 vWorldDirection;

				#include <common>

				void main() {

					vec3 direction = normalize( vWorldDirection );

					vec2 sampleUV = equirectUv( direction );

					gl_FragColor = texture2D( tEquirect, sampleUV );

				}
			`},s=new rs(5,5,5),r=new _n({name:"CubemapFromEquirect",uniforms:Ri(n.uniforms),vertexShader:n.vertexShader,fragmentShader:n.fragmentShader,side:ke,blending:Vn});r.uniforms.tEquirect.value=e;let a=new Te(s,r),o=e.minFilter;return e.minFilter===ci&&(e.minFilter=mn),new jr(1,10,this).update(t,a),e.minFilter=o,a.geometry.dispose(),a.material.dispose(),this}clear(t,e=!0,n=!0,s=!0){let r=t.getRenderTarget();for(let a=0;a<6;a++)t.setRenderTarget(this,a),t.clear(e,n,s);t.setRenderTarget(r)}},Fn=class extends Ee{constructor(){super(),this.isGroup=!0,this.type="Group"}},Fu={type:"move"},as=class{constructor(){this._targetRay=null,this._grip=null,this._hand=null}getHandSpace(){return this._hand===null&&(this._hand=new Fn,this._hand.matrixAutoUpdate=!1,this._hand.visible=!1,this._hand.joints={},this._hand.inputState={pinching:!1}),this._hand}getTargetRaySpace(){return this._targetRay===null&&(this._targetRay=new Fn,this._targetRay.matrixAutoUpdate=!1,this._targetRay.visible=!1,this._targetRay.hasLinearVelocity=!1,this._targetRay.linearVelocity=new L,this._targetRay.hasAngularVelocity=!1,this._targetRay.angularVelocity=new L),this._targetRay}getGripSpace(){return this._grip===null&&(this._grip=new Fn,this._grip.matrixAutoUpdate=!1,this._grip.visible=!1,this._grip.hasLinearVelocity=!1,this._grip.linearVelocity=new L,this._grip.hasAngularVelocity=!1,this._grip.angularVelocity=new L),this._grip}dispatchEvent(t){return this._targetRay!==null&&this._targetRay.dispatchEvent(t),this._grip!==null&&this._grip.dispatchEvent(t),this._hand!==null&&this._hand.dispatchEvent(t),this}connect(t){if(t&&t.hand){let e=this._hand;if(e)for(let n of t.hand.values())this._getHandJoint(e,n)}return this.dispatchEvent({type:"connected",data:t}),this}disconnect(t){return this.dispatchEvent({type:"disconnected",data:t}),this._targetRay!==null&&(this._targetRay.visible=!1),this._grip!==null&&(this._grip.visible=!1),this._hand!==null&&(this._hand.visible=!1),this}update(t,e,n){let s=null,r=null,a=null,o=this._targetRay,l=this._grip,c=this._hand;if(t&&e.session.visibilityState!=="visible-blurred"){if(c&&t.hand){a=!0;for(let y of t.hand.values()){let m=e.getJointPose(y,n),p=this._getHandJoint(c,y);m!==null&&(p.matrix.fromArray(m.transform.matrix),p.matrix.decompose(p.position,p.rotation,p.scale),p.matrixWorldNeedsUpdate=!0,p.jointRadius=m.radius),p.visible=m!==null}let u=c.joints["index-finger-tip"],d=c.joints["thumb-tip"],h=u.position.distanceTo(d.position),f=.02,_=.005;c.inputState.pinching&&h>f+_?(c.inputState.pinching=!1,this.dispatchEvent({type:"pinchend",handedness:t.handedness,target:this})):!c.inputState.pinching&&h<=f-_&&(c.inputState.pinching=!0,this.dispatchEvent({type:"pinchstart",handedness:t.handedness,target:this}))}else l!==null&&t.gripSpace&&(r=e.getPose(t.gripSpace,n),r!==null&&(l.matrix.fromArray(r.transform.matrix),l.matrix.decompose(l.position,l.rotation,l.scale),l.matrixWorldNeedsUpdate=!0,r.linearVelocity?(l.hasLinearVelocity=!0,l.linearVelocity.copy(r.linearVelocity)):l.hasLinearVelocity=!1,r.angularVelocity?(l.hasAngularVelocity=!0,l.angularVelocity.copy(r.angularVelocity)):l.hasAngularVelocity=!1));o!==null&&(s=e.getPose(t.targetRaySpace,n),s===null&&r!==null&&(s=r),s!==null&&(o.matrix.fromArray(s.transform.matrix),o.matrix.decompose(o.position,o.rotation,o.scale),o.matrixWorldNeedsUpdate=!0,s.linearVelocity?(o.hasLinearVelocity=!0,o.linearVelocity.copy(s.linearVelocity)):o.hasLinearVelocity=!1,s.angularVelocity?(o.hasAngularVelocity=!0,o.angularVelocity.copy(s.angularVelocity)):o.hasAngularVelocity=!1,this.dispatchEvent(Fu)))}return o!==null&&(o.visible=s!==null),l!==null&&(l.visible=r!==null),c!==null&&(c.visible=a!==null),this}_getHandJoint(t,e){if(t.joints[e.jointName]===void 0){let n=new Fn;n.matrixAutoUpdate=!1,n.visible=!1,t.joints[e.jointName]=n,t.add(n)}return t.joints[e.jointName]}};var Ws=class extends Ee{constructor(){super(),this.isScene=!0,this.type="Scene",this.background=null,this.environment=null,this.fog=null,this.backgroundBlurriness=0,this.backgroundIntensity=1,this.backgroundRotation=new gn,this.environmentIntensity=1,this.environmentRotation=new gn,this.overrideMaterial=null,typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}copy(t,e){return super.copy(t,e),t.background!==null&&(this.background=t.background.clone()),t.environment!==null&&(this.environment=t.environment.clone()),t.fog!==null&&(this.fog=t.fog.clone()),this.backgroundBlurriness=t.backgroundBlurriness,this.backgroundIntensity=t.backgroundIntensity,this.backgroundRotation.copy(t.backgroundRotation),this.environmentIntensity=t.environmentIntensity,this.environmentRotation.copy(t.environmentRotation),t.overrideMaterial!==null&&(this.overrideMaterial=t.overrideMaterial.clone()),this.matrixAutoUpdate=t.matrixAutoUpdate,this}toJSON(t){let e=super.toJSON(t);return this.fog!==null&&(e.object.fog=this.fog.toJSON()),this.backgroundBlurriness>0&&(e.object.backgroundBlurriness=this.backgroundBlurriness),this.backgroundIntensity!==1&&(e.object.backgroundIntensity=this.backgroundIntensity),e.object.backgroundRotation=this.backgroundRotation.toArray(),this.environmentIntensity!==1&&(e.object.environmentIntensity=this.environmentIntensity),e.object.environmentRotation=this.environmentRotation.toArray(),e}};var ta=class extends Xe{constructor(t=null,e=1,n=1,s,r,a,o,l,c=We,u=We,d,h){super(null,a,o,l,c,u,s,r,d,h),this.isDataTexture=!0,this.image={data:t,width:e,height:n},this.generateMipmaps=!1,this.flipY=!1,this.unpackAlignment=1}};var Xs=class extends we{constructor(t,e,n,s=1){super(t,e,n),this.isInstancedBufferAttribute=!0,this.meshPerAttribute=s}copy(t){return super.copy(t),this.meshPerAttribute=t.meshPerAttribute,this}toJSON(){let t=super.toJSON();return t.meshPerAttribute=this.meshPerAttribute,t.isInstancedBufferAttribute=!0,t}},Ki=new Jt,Jc=new Jt,Br=[],Kc=new tn,Ou=new Jt,Ps=new Te,Is=new zn,$s=class extends Te{constructor(t,e,n){super(t,e),this.isInstancedMesh=!0,this.instanceMatrix=new Xs(new Float32Array(n*16),16),this.instanceColor=null,this.morphTexture=null,this.count=n,this.boundingBox=null,this.boundingSphere=null;for(let s=0;s<n;s++)this.setMatrixAt(s,Ou)}computeBoundingBox(){let t=this.geometry,e=this.count;this.boundingBox===null&&(this.boundingBox=new tn),t.boundingBox===null&&t.computeBoundingBox(),this.boundingBox.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ki),Kc.copy(t.boundingBox).applyMatrix4(Ki),this.boundingBox.union(Kc)}computeBoundingSphere(){let t=this.geometry,e=this.count;this.boundingSphere===null&&(this.boundingSphere=new zn),t.boundingSphere===null&&t.computeBoundingSphere(),this.boundingSphere.makeEmpty();for(let n=0;n<e;n++)this.getMatrixAt(n,Ki),Is.copy(t.boundingSphere).applyMatrix4(Ki),this.boundingSphere.union(Is)}copy(t,e){return super.copy(t,e),this.instanceMatrix.copy(t.instanceMatrix),t.morphTexture!==null&&(this.morphTexture=t.morphTexture.clone()),t.instanceColor!==null&&(this.instanceColor=t.instanceColor.clone()),this.count=t.count,t.boundingBox!==null&&(this.boundingBox=t.boundingBox.clone()),t.boundingSphere!==null&&(this.boundingSphere=t.boundingSphere.clone()),this}getColorAt(t,e){e.fromArray(this.instanceColor.array,t*3)}getMatrixAt(t,e){e.fromArray(this.instanceMatrix.array,t*16)}getMorphAt(t,e){let n=e.morphTargetInfluences,s=this.morphTexture.source.data.data,r=n.length+1,a=t*r+1;for(let o=0;o<n.length;o++)n[o]=s[a+o]}raycast(t,e){let n=this.matrixWorld,s=this.count;if(Ps.geometry=this.geometry,Ps.material=this.material,Ps.material!==void 0&&(this.boundingSphere===null&&this.computeBoundingSphere(),Is.copy(this.boundingSphere),Is.applyMatrix4(n),t.ray.intersectsSphere(Is)!==!1))for(let r=0;r<s;r++){this.getMatrixAt(r,Ki),Jc.multiplyMatrices(n,Ki),Ps.matrixWorld=Jc,Ps.raycast(t,Br);for(let a=0,o=Br.length;a<o;a++){let l=Br[a];l.instanceId=r,l.object=this,e.push(l)}Br.length=0}}setColorAt(t,e){this.instanceColor===null&&(this.instanceColor=new Xs(new Float32Array(this.instanceMatrix.count*3).fill(1),3)),e.toArray(this.instanceColor.array,t*3)}setMatrixAt(t,e){e.toArray(this.instanceMatrix.array,t*16)}setMorphAt(t,e){let n=e.morphTargetInfluences,s=n.length+1;this.morphTexture===null&&(this.morphTexture=new ta(new Float32Array(s*this.count),s,this.count,La,yn));let r=this.morphTexture.source.data.data,a=0;for(let c=0;c<n.length;c++)a+=n[c];let o=this.geometry.morphTargetsRelative?1:1-a,l=s*t;r[l]=o,r.set(n,l+1)}updateMorphTargets(){}dispose(){this.dispatchEvent({type:"dispose"}),this.morphTexture!==null&&(this.morphTexture.dispose(),this.morphTexture=null)}},il=new L,Bu=new L,zu=new Ot,an=class{constructor(t=new L(1,0,0),e=0){this.isPlane=!0,this.normal=t,this.constant=e}set(t,e){return this.normal.copy(t),this.constant=e,this}setComponents(t,e,n,s){return this.normal.set(t,e,n),this.constant=s,this}setFromNormalAndCoplanarPoint(t,e){return this.normal.copy(t),this.constant=-e.dot(this.normal),this}setFromCoplanarPoints(t,e,n){let s=il.subVectors(n,e).cross(Bu.subVectors(t,e)).normalize();return this.setFromNormalAndCoplanarPoint(s,t),this}copy(t){return this.normal.copy(t.normal),this.constant=t.constant,this}normalize(){let t=1/this.normal.length();return this.normal.multiplyScalar(t),this.constant*=t,this}negate(){return this.constant*=-1,this.normal.negate(),this}distanceToPoint(t){return this.normal.dot(t)+this.constant}distanceToSphere(t){return this.distanceToPoint(t.center)-t.radius}projectPoint(t,e){return e.copy(t).addScaledVector(this.normal,-this.distanceToPoint(t))}intersectLine(t,e){let n=t.delta(il),s=this.normal.dot(n);if(s===0)return this.distanceToPoint(t.start)===0?e.copy(t.start):null;let r=-(t.start.dot(this.normal)+this.constant)/s;return r<0||r>1?null:e.copy(t.start).addScaledVector(n,r)}intersectsLine(t){let e=this.distanceToPoint(t.start),n=this.distanceToPoint(t.end);return e<0&&n>0||n<0&&e>0}intersectsBox(t){return t.intersectsPlane(this)}intersectsSphere(t){return t.intersectsPlane(this)}coplanarPoint(t){return t.copy(this.normal).multiplyScalar(-this.constant)}applyMatrix4(t,e){let n=e||zu.getNormalMatrix(t),s=this.coplanarPoint(il).applyMatrix4(t),r=this.normal.applyMatrix3(n).normalize();return this.constant=-s.dot(r),this}translate(t){return this.constant-=t.dot(this.normal),this}equals(t){return t.normal.equals(this.normal)&&t.constant===this.constant}clone(){return new this.constructor().copy(this)}},xi=new zn,ku=new Dt(.5,.5),zr=new L,os=class{constructor(t=new an,e=new an,n=new an,s=new an,r=new an,a=new an){this.planes=[t,e,n,s,r,a]}set(t,e,n,s,r,a){let o=this.planes;return o[0].copy(t),o[1].copy(e),o[2].copy(n),o[3].copy(s),o[4].copy(r),o[5].copy(a),this}copy(t){let e=this.planes;for(let n=0;n<6;n++)e[n].copy(t.planes[n]);return this}setFromProjectionMatrix(t,e=fn,n=!1){let s=this.planes,r=t.elements,a=r[0],o=r[1],l=r[2],c=r[3],u=r[4],d=r[5],h=r[6],f=r[7],_=r[8],y=r[9],m=r[10],p=r[11],w=r[12],E=r[13],M=r[14],P=r[15];if(s[0].setComponents(c-a,f-u,p-_,P-w).normalize(),s[1].setComponents(c+a,f+u,p+_,P+w).normalize(),s[2].setComponents(c+o,f+d,p+y,P+E).normalize(),s[3].setComponents(c-o,f-d,p-y,P-E).normalize(),n)s[4].setComponents(l,h,m,M).normalize(),s[5].setComponents(c-l,f-h,p-m,P-M).normalize();else if(s[4].setComponents(c-l,f-h,p-m,P-M).normalize(),e===fn)s[5].setComponents(c+l,f+h,p+m,P+M).normalize();else if(e===Os)s[5].setComponents(l,h,m,M).normalize();else throw new Error("THREE.Frustum.setFromProjectionMatrix(): Invalid coordinate system: "+e);return this}intersectsObject(t){if(t.boundingSphere!==void 0)t.boundingSphere===null&&t.computeBoundingSphere(),xi.copy(t.boundingSphere).applyMatrix4(t.matrixWorld);else{let e=t.geometry;e.boundingSphere===null&&e.computeBoundingSphere(),xi.copy(e.boundingSphere).applyMatrix4(t.matrixWorld)}return this.intersectsSphere(xi)}intersectsSprite(t){xi.center.set(0,0,0);let e=ku.distanceTo(t.center);return xi.radius=.7071067811865476+e,xi.applyMatrix4(t.matrixWorld),this.intersectsSphere(xi)}intersectsSphere(t){let e=this.planes,n=t.center,s=-t.radius;for(let r=0;r<6;r++)if(e[r].distanceToPoint(n)<s)return!1;return!0}intersectsBox(t){let e=this.planes;for(let n=0;n<6;n++){let s=e[n];if(zr.x=s.normal.x>0?t.max.x:t.min.x,zr.y=s.normal.y>0?t.max.y:t.min.y,zr.z=s.normal.z>0?t.max.z:t.min.z,s.distanceToPoint(zr)<0)return!1}return!0}containsPoint(t){let e=this.planes;for(let n=0;n<6;n++)if(e[n].distanceToPoint(t)<0)return!1;return!0}clone(){return new this.constructor().copy(this)}};var qs=class extends kn{constructor(t){super(),this.isLineBasicMaterial=!0,this.type="LineBasicMaterial",this.color=new kt(16777215),this.map=null,this.linewidth=1,this.linecap="round",this.linejoin="round",this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.color.copy(t.color),this.map=t.map,this.linewidth=t.linewidth,this.linecap=t.linecap,this.linejoin=t.linejoin,this.fog=t.fog,this}},ea=new L,na=new L,jc=new Jt,Ls=new ii,kr=new zn,sl=new L,Qc=new L,ia=class extends Ee{constructor(t=new $e,e=new qs){super(),this.isLine=!0,this.type="Line",this.geometry=t,this.material=e,this.morphTargetDictionary=void 0,this.morphTargetInfluences=void 0,this.updateMorphTargets()}copy(t,e){return super.copy(t,e),this.material=Array.isArray(t.material)?t.material.slice():t.material,this.geometry=t.geometry,this}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[0];for(let s=1,r=e.count;s<r;s++)ea.fromBufferAttribute(e,s-1),na.fromBufferAttribute(e,s),n[s]=n[s-1],n[s]+=ea.distanceTo(na);t.setAttribute("lineDistance",new Ge(n,1))}else console.warn("THREE.Line.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}raycast(t,e){let n=this.geometry,s=this.matrixWorld,r=t.params.Line.threshold,a=n.drawRange;if(n.boundingSphere===null&&n.computeBoundingSphere(),kr.copy(n.boundingSphere),kr.applyMatrix4(s),kr.radius+=r,t.ray.intersectsSphere(kr)===!1)return;jc.copy(s).invert(),Ls.copy(t.ray).applyMatrix4(jc);let o=r/((this.scale.x+this.scale.y+this.scale.z)/3),l=o*o,c=this.isLineSegments?2:1,u=n.index,h=n.attributes.position;if(u!==null){let f=Math.max(0,a.start),_=Math.min(u.count,a.start+a.count);for(let y=f,m=_-1;y<m;y+=c){let p=u.getX(y),w=u.getX(y+1),E=Vr(this,t,Ls,l,p,w,y);E&&e.push(E)}if(this.isLineLoop){let y=u.getX(_-1),m=u.getX(f),p=Vr(this,t,Ls,l,y,m,_-1);p&&e.push(p)}}else{let f=Math.max(0,a.start),_=Math.min(h.count,a.start+a.count);for(let y=f,m=_-1;y<m;y+=c){let p=Vr(this,t,Ls,l,y,y+1,y);p&&e.push(p)}if(this.isLineLoop){let y=Vr(this,t,Ls,l,_-1,f,_-1);y&&e.push(y)}}}updateMorphTargets(){let e=this.geometry.morphAttributes,n=Object.keys(e);if(n.length>0){let s=e[n[0]];if(s!==void 0){this.morphTargetInfluences=[],this.morphTargetDictionary={};for(let r=0,a=s.length;r<a;r++){let o=s[r].name||String(r);this.morphTargetInfluences.push(0),this.morphTargetDictionary[o]=r}}}}};function Vr(i,t,e,n,s,r,a){let o=i.geometry.attributes.position;if(ea.fromBufferAttribute(o,s),na.fromBufferAttribute(o,r),e.distanceSqToSegment(ea,na,sl,Qc)>n)return;sl.applyMatrix4(i.matrixWorld);let c=t.ray.origin.distanceTo(sl);if(!(c<t.near||c>t.far))return{distance:c,point:Qc.clone().applyMatrix4(i.matrixWorld),index:a,face:null,faceIndex:null,barycoord:null,object:i}}var th=new L,eh=new L,sa=class extends ia{constructor(t,e){super(t,e),this.isLineSegments=!0,this.type="LineSegments"}computeLineDistances(){let t=this.geometry;if(t.index===null){let e=t.attributes.position,n=[];for(let s=0,r=e.count;s<r;s+=2)th.fromBufferAttribute(e,s),eh.fromBufferAttribute(e,s+1),n[s]=s===0?0:n[s-1],n[s+1]=n[s]+th.distanceTo(eh);t.setAttribute("lineDistance",new Ge(n,1))}else console.warn("THREE.LineSegments.computeLineDistances(): Computation only possible with non-indexed BufferGeometry.");return this}};var Ys=class extends Xe{constructor(t,e,n=hi,s,r,a,o=We,l=We,c,u=ts,d=1){if(u!==ts&&u!==us)throw new Error("DepthTexture format must be either THREE.DepthFormat or THREE.DepthStencilFormat");let h={width:t,height:e,depth:d};super(h,s,r,a,o,l,u,n,c),this.isDepthTexture=!0,this.flipY=!1,this.generateMipmaps=!1,this.compareFunction=null}copy(t){return super.copy(t),this.source=new is(Object.assign({},t.image)),this.compareFunction=t.compareFunction,this}toJSON(t){let e=super.toJSON(t);return this.compareFunction!==null&&(e.compareFunction=this.compareFunction),e}},Zs=class extends Xe{constructor(t=null){super(),this.sourceTexture=t,this.isExternalTexture=!0}copy(t){return super.copy(t),this.sourceTexture=t.sourceTexture,this}};var wi=class i extends $e{constructor(t=1,e=1,n=1,s=1){super(),this.type="PlaneGeometry",this.parameters={width:t,height:e,widthSegments:n,heightSegments:s};let r=t/2,a=e/2,o=Math.floor(n),l=Math.floor(s),c=o+1,u=l+1,d=t/o,h=e/l,f=[],_=[],y=[],m=[];for(let p=0;p<u;p++){let w=p*h-a;for(let E=0;E<c;E++){let M=E*d-r;_.push(M,-w,0),y.push(0,0,1),m.push(E/o),m.push(1-p/l)}}for(let p=0;p<l;p++)for(let w=0;w<o;w++){let E=w+c*p,M=w+c*(p+1),P=w+1+c*(p+1),R=w+1+c*p;f.push(E,M,R),f.push(M,P,R)}this.setIndex(f),this.setAttribute("position",new Ge(_,3)),this.setAttribute("normal",new Ge(y,3)),this.setAttribute("uv",new Ge(m,2))}copy(t){return super.copy(t),this.parameters=Object.assign({},t.parameters),this}static fromJSON(t){return new i(t.width,t.height,t.widthSegments,t.heightSegments)}};var ls=class extends kn{constructor(t){super(),this.isMeshStandardMaterial=!0,this.type="MeshStandardMaterial",this.defines={STANDARD:""},this.color=new kt(16777215),this.roughness=1,this.metalness=0,this.map=null,this.lightMap=null,this.lightMapIntensity=1,this.aoMap=null,this.aoMapIntensity=1,this.emissive=new kt(0),this.emissiveIntensity=1,this.emissiveMap=null,this.bumpMap=null,this.bumpScale=1,this.normalMap=null,this.normalMapType=Rl,this.normalScale=new Dt(1,1),this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.roughnessMap=null,this.metalnessMap=null,this.alphaMap=null,this.envMap=null,this.envMapRotation=new gn,this.envMapIntensity=1,this.wireframe=!1,this.wireframeLinewidth=1,this.wireframeLinecap="round",this.wireframeLinejoin="round",this.flatShading=!1,this.fog=!0,this.setValues(t)}copy(t){return super.copy(t),this.defines={STANDARD:""},this.color.copy(t.color),this.roughness=t.roughness,this.metalness=t.metalness,this.map=t.map,this.lightMap=t.lightMap,this.lightMapIntensity=t.lightMapIntensity,this.aoMap=t.aoMap,this.aoMapIntensity=t.aoMapIntensity,this.emissive.copy(t.emissive),this.emissiveMap=t.emissiveMap,this.emissiveIntensity=t.emissiveIntensity,this.bumpMap=t.bumpMap,this.bumpScale=t.bumpScale,this.normalMap=t.normalMap,this.normalMapType=t.normalMapType,this.normalScale.copy(t.normalScale),this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.roughnessMap=t.roughnessMap,this.metalnessMap=t.metalnessMap,this.alphaMap=t.alphaMap,this.envMap=t.envMap,this.envMapRotation.copy(t.envMapRotation),this.envMapIntensity=t.envMapIntensity,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this.wireframeLinecap=t.wireframeLinecap,this.wireframeLinejoin=t.wireframeLinejoin,this.flatShading=t.flatShading,this.fog=t.fog,this}};var ra=class extends kn{constructor(t){super(),this.isMeshDepthMaterial=!0,this.type="MeshDepthMaterial",this.depthPacking=Uh,this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.wireframe=!1,this.wireframeLinewidth=1,this.setValues(t)}copy(t){return super.copy(t),this.depthPacking=t.depthPacking,this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this.wireframe=t.wireframe,this.wireframeLinewidth=t.wireframeLinewidth,this}},aa=class extends kn{constructor(t){super(),this.isMeshDistanceMaterial=!0,this.type="MeshDistanceMaterial",this.map=null,this.alphaMap=null,this.displacementMap=null,this.displacementScale=1,this.displacementBias=0,this.setValues(t)}copy(t){return super.copy(t),this.map=t.map,this.alphaMap=t.alphaMap,this.displacementMap=t.displacementMap,this.displacementScale=t.displacementScale,this.displacementBias=t.displacementBias,this}};function Hr(i,t){return!i||i.constructor===t?i:typeof t.BYTES_PER_ELEMENT=="number"?new t(i):Array.prototype.slice.call(i)}function Vu(i){return ArrayBuffer.isView(i)&&!(i instanceof DataView)}var Ei=class{constructor(t,e,n,s){this.parameterPositions=t,this._cachedIndex=0,this.resultBuffer=s!==void 0?s:new e.constructor(n),this.sampleValues=e,this.valueSize=n,this.settings=null,this.DefaultSettings_={}}evaluate(t){let e=this.parameterPositions,n=this._cachedIndex,s=e[n],r=e[n-1];n:{t:{let a;e:{i:if(!(t<s)){for(let o=n+2;;){if(s===void 0){if(t<r)break i;return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}if(n===o)break;if(r=s,s=e[++n],t<s)break t}a=e.length;break e}if(!(t>=r)){let o=e[1];t<o&&(n=2,r=o);for(let l=n-2;;){if(r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(n===l)break;if(s=r,r=e[--n-1],t>=r)break t}a=n,n=0;break e}break n}for(;n<a;){let o=n+a>>>1;t<e[o]?a=o:n=o+1}if(s=e[n],r=e[n-1],r===void 0)return this._cachedIndex=0,this.copySampleValue_(0);if(s===void 0)return n=e.length,this._cachedIndex=n,this.copySampleValue_(n-1)}this._cachedIndex=n,this.intervalChanged_(n,r,s)}return this.interpolate_(n,r,t,s)}getSettings_(){return this.settings||this.DefaultSettings_}copySampleValue_(t){let e=this.resultBuffer,n=this.sampleValues,s=this.valueSize,r=t*s;for(let a=0;a!==s;++a)e[a]=n[r+a];return e}interpolate_(){throw new Error("call to abstract method")}intervalChanged_(){}},oa=class extends Ei{constructor(t,e,n,s){super(t,e,n,s),this._weightPrev=-0,this._offsetPrev=-0,this._weightNext=-0,this._offsetNext=-0,this.DefaultSettings_={endingStart:al,endingEnd:al}}intervalChanged_(t,e,n){let s=this.parameterPositions,r=t-2,a=t+1,o=s[r],l=s[a];if(o===void 0)switch(this.getSettings_().endingStart){case ol:r=t,o=2*e-n;break;case ll:r=s.length-2,o=e+s[r]-s[r+1];break;default:r=t,o=n}if(l===void 0)switch(this.getSettings_().endingEnd){case ol:a=t,l=2*n-e;break;case ll:a=1,l=n+s[1]-s[0];break;default:a=t-1,l=e}let c=(n-e)*.5,u=this.valueSize;this._weightPrev=c/(e-o),this._weightNext=c/(l-n),this._offsetPrev=r*u,this._offsetNext=a*u}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=this._offsetPrev,d=this._offsetNext,h=this._weightPrev,f=this._weightNext,_=(n-e)/(s-e),y=_*_,m=y*_,p=-h*m+2*h*y-h*_,w=(1+h)*m+(-1.5-2*h)*y+(-.5+h)*_+1,E=(-1-f)*m+(1.5+f)*y+.5*_,M=f*m-f*y;for(let P=0;P!==o;++P)r[P]=p*a[u+P]+w*a[c+P]+E*a[l+P]+M*a[d+P];return r}},la=class extends Ei{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=t*o,c=l-o,u=(n-e)/(s-e),d=1-u;for(let h=0;h!==o;++h)r[h]=a[c+h]*d+a[l+h]*u;return r}},ca=class extends Ei{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t){return this.copySampleValue_(t-1)}},en=class{constructor(t,e,n,s){if(t===void 0)throw new Error("THREE.KeyframeTrack: track name is undefined");if(e===void 0||e.length===0)throw new Error("THREE.KeyframeTrack: no keyframes in track named "+t);this.name=t,this.times=Hr(e,this.TimeBufferType),this.values=Hr(n,this.ValueBufferType),this.setInterpolation(s||this.DefaultInterpolation)}static toJSON(t){let e=t.constructor,n;if(e.toJSON!==this.toJSON)n=e.toJSON(t);else{n={name:t.name,times:Hr(t.times,Array),values:Hr(t.values,Array)};let s=t.getInterpolation();s!==t.DefaultInterpolation&&(n.interpolation=s)}return n.type=t.ValueTypeName,n}InterpolantFactoryMethodDiscrete(t){return new ca(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodLinear(t){return new la(this.times,this.values,this.getValueSize(),t)}InterpolantFactoryMethodSmooth(t){return new oa(this.times,this.values,this.getValueSize(),t)}setInterpolation(t){let e;switch(t){case Us:e=this.InterpolantFactoryMethodDiscrete;break;case Yr:e=this.InterpolantFactoryMethodLinear;break;case Gr:e=this.InterpolantFactoryMethodSmooth;break}if(e===void 0){let n="unsupported interpolation for "+this.ValueTypeName+" keyframe track named "+this.name;if(this.createInterpolant===void 0)if(t!==this.DefaultInterpolation)this.setInterpolation(this.DefaultInterpolation);else throw new Error(n);return console.warn("THREE.KeyframeTrack:",n),this}return this.createInterpolant=e,this}getInterpolation(){switch(this.createInterpolant){case this.InterpolantFactoryMethodDiscrete:return Us;case this.InterpolantFactoryMethodLinear:return Yr;case this.InterpolantFactoryMethodSmooth:return Gr}}getValueSize(){return this.values.length/this.times.length}shift(t){if(t!==0){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]+=t}return this}scale(t){if(t!==1){let e=this.times;for(let n=0,s=e.length;n!==s;++n)e[n]*=t}return this}trim(t,e){let n=this.times,s=n.length,r=0,a=s-1;for(;r!==s&&n[r]<t;)++r;for(;a!==-1&&n[a]>e;)--a;if(++a,r!==0||a!==s){r>=a&&(a=Math.max(a,1),r=a-1);let o=this.getValueSize();this.times=n.slice(r,a),this.values=this.values.slice(r*o,a*o)}return this}validate(){let t=!0,e=this.getValueSize();e-Math.floor(e)!==0&&(console.error("THREE.KeyframeTrack: Invalid value size in track.",this),t=!1);let n=this.times,s=this.values,r=n.length;r===0&&(console.error("THREE.KeyframeTrack: Track is empty.",this),t=!1);let a=null;for(let o=0;o!==r;o++){let l=n[o];if(typeof l=="number"&&isNaN(l)){console.error("THREE.KeyframeTrack: Time is not a valid number.",this,o,l),t=!1;break}if(a!==null&&a>l){console.error("THREE.KeyframeTrack: Out of order keys.",this,o,l,a),t=!1;break}a=l}if(s!==void 0&&Vu(s))for(let o=0,l=s.length;o!==l;++o){let c=s[o];if(isNaN(c)){console.error("THREE.KeyframeTrack: Value is not a valid number.",this,o,c),t=!1;break}}return t}optimize(){let t=this.times.slice(),e=this.values.slice(),n=this.getValueSize(),s=this.getInterpolation()===Gr,r=t.length-1,a=1;for(let o=1;o<r;++o){let l=!1,c=t[o],u=t[o+1];if(c!==u&&(o!==1||c!==t[0]))if(s)l=!0;else{let d=o*n,h=d-n,f=d+n;for(let _=0;_!==n;++_){let y=e[d+_];if(y!==e[h+_]||y!==e[f+_]){l=!0;break}}}if(l){if(o!==a){t[a]=t[o];let d=o*n,h=a*n;for(let f=0;f!==n;++f)e[h+f]=e[d+f]}++a}}if(r>0){t[a]=t[r];for(let o=r*n,l=a*n,c=0;c!==n;++c)e[l+c]=e[o+c];++a}return a!==t.length?(this.times=t.slice(0,a),this.values=e.slice(0,a*n)):(this.times=t,this.values=e),this}clone(){let t=this.times.slice(),e=this.values.slice(),n=this.constructor,s=new n(this.name,t,e);return s.createInterpolant=this.createInterpolant,s}};en.prototype.ValueTypeName="";en.prototype.TimeBufferType=Float32Array;en.prototype.ValueBufferType=Float32Array;en.prototype.DefaultInterpolation=Yr;var si=class extends en{constructor(t,e,n){super(t,e,n)}};si.prototype.ValueTypeName="bool";si.prototype.ValueBufferType=Array;si.prototype.DefaultInterpolation=Us;si.prototype.InterpolantFactoryMethodLinear=void 0;si.prototype.InterpolantFactoryMethodSmooth=void 0;var ha=class extends en{constructor(t,e,n,s){super(t,e,n,s)}};ha.prototype.ValueTypeName="color";var da=class extends en{constructor(t,e,n,s){super(t,e,n,s)}};da.prototype.ValueTypeName="number";var ua=class extends Ei{constructor(t,e,n,s){super(t,e,n,s)}interpolate_(t,e,n,s){let r=this.resultBuffer,a=this.sampleValues,o=this.valueSize,l=(n-e)/(s-e),c=t*o;for(let u=c+o;c!==u;c+=4)Ue.slerpFlat(r,0,a,c-o,a,c,l);return r}},Js=class extends en{constructor(t,e,n,s){super(t,e,n,s)}InterpolantFactoryMethodLinear(t){return new ua(this.times,this.values,this.getValueSize(),t)}};Js.prototype.ValueTypeName="quaternion";Js.prototype.InterpolantFactoryMethodSmooth=void 0;var ri=class extends en{constructor(t,e,n){super(t,e,n)}};ri.prototype.ValueTypeName="string";ri.prototype.ValueBufferType=Array;ri.prototype.DefaultInterpolation=Us;ri.prototype.InterpolantFactoryMethodLinear=void 0;ri.prototype.InterpolantFactoryMethodSmooth=void 0;var pa=class extends en{constructor(t,e,n,s){super(t,e,n,s)}};pa.prototype.ValueTypeName="vector";var fa=class{constructor(t,e,n){let s=this,r=!1,a=0,o=0,l,c=[];this.onStart=void 0,this.onLoad=t,this.onProgress=e,this.onError=n,this.abortController=new AbortController,this.itemStart=function(u){o++,r===!1&&s.onStart!==void 0&&s.onStart(u,a,o),r=!0},this.itemEnd=function(u){a++,s.onProgress!==void 0&&s.onProgress(u,a,o),a===o&&(r=!1,s.onLoad!==void 0&&s.onLoad())},this.itemError=function(u){s.onError!==void 0&&s.onError(u)},this.resolveURL=function(u){return l?l(u):u},this.setURLModifier=function(u){return l=u,this},this.addHandler=function(u,d){return c.push(u,d),this},this.removeHandler=function(u){let d=c.indexOf(u);return d!==-1&&c.splice(d,2),this},this.getHandler=function(u){for(let d=0,h=c.length;d<h;d+=2){let f=c[d],_=c[d+1];if(f.global&&(f.lastIndex=0),f.test(u))return _}return null},this.abort=function(){return this.abortController.abort(),this.abortController=new AbortController,this}}},Zh=new fa,ma=class{constructor(t){this.manager=t!==void 0?t:Zh,this.crossOrigin="anonymous",this.withCredentials=!1,this.path="",this.resourcePath="",this.requestHeader={}}load(){}loadAsync(t,e){let n=this;return new Promise(function(s,r){n.load(t,s,e,r)})}parse(){}setCrossOrigin(t){return this.crossOrigin=t,this}setWithCredentials(t){return this.withCredentials=t,this}setPath(t){return this.path=t,this}setResourcePath(t){return this.resourcePath=t,this}setRequestHeader(t){return this.requestHeader=t,this}abort(){return this}};ma.DEFAULT_MATERIAL_NAME="__DEFAULT";var Ks=class extends Ee{constructor(t,e=1){super(),this.isLight=!0,this.type="Light",this.color=new kt(t),this.intensity=e}dispose(){}copy(t,e){return super.copy(t,e),this.color.copy(t.color),this.intensity=t.intensity,this}toJSON(t){let e=super.toJSON(t);return e.object.color=this.color.getHex(),e.object.intensity=this.intensity,this.groundColor!==void 0&&(e.object.groundColor=this.groundColor.getHex()),this.distance!==void 0&&(e.object.distance=this.distance),this.angle!==void 0&&(e.object.angle=this.angle),this.decay!==void 0&&(e.object.decay=this.decay),this.penumbra!==void 0&&(e.object.penumbra=this.penumbra),this.shadow!==void 0&&(e.object.shadow=this.shadow.toJSON()),this.target!==void 0&&(e.object.target=this.target.uuid),e}},js=class extends Ks{constructor(t,e,n){super(t,n),this.isHemisphereLight=!0,this.type="HemisphereLight",this.position.copy(Ee.DEFAULT_UP),this.updateMatrix(),this.groundColor=new kt(e)}copy(t,e){return super.copy(t,e),this.groundColor.copy(t.groundColor),this}},rl=new Jt,nh=new L,ih=new L,dl=class{constructor(t){this.camera=t,this.intensity=1,this.bias=0,this.normalBias=0,this.radius=1,this.blurSamples=8,this.mapSize=new Dt(512,512),this.mapType=xn,this.map=null,this.mapPass=null,this.matrix=new Jt,this.autoUpdate=!0,this.needsUpdate=!1,this._frustum=new os,this._frameExtents=new Dt(1,1),this._viewportCount=1,this._viewports=[new de(0,0,1,1)]}getViewportCount(){return this._viewportCount}getFrustum(){return this._frustum}updateMatrices(t){let e=this.camera,n=this.matrix;nh.setFromMatrixPosition(t.matrixWorld),e.position.copy(nh),ih.setFromMatrixPosition(t.target.matrixWorld),e.lookAt(ih),e.updateMatrixWorld(),rl.multiplyMatrices(e.projectionMatrix,e.matrixWorldInverse),this._frustum.setFromProjectionMatrix(rl,e.coordinateSystem,e.reversedDepth),e.reversedDepth?n.set(.5,0,0,.5,0,.5,0,.5,0,0,1,0,0,0,0,1):n.set(.5,0,0,.5,0,.5,0,.5,0,0,.5,.5,0,0,0,1),n.multiply(rl)}getViewport(t){return this._viewports[t]}getFrameExtents(){return this._frameExtents}dispose(){this.map&&this.map.dispose(),this.mapPass&&this.mapPass.dispose()}copy(t){return this.camera=t.camera.clone(),this.intensity=t.intensity,this.bias=t.bias,this.radius=t.radius,this.autoUpdate=t.autoUpdate,this.needsUpdate=t.needsUpdate,this.normalBias=t.normalBias,this.blurSamples=t.blurSamples,this.mapSize.copy(t.mapSize),this}clone(){return new this.constructor().copy(this)}toJSON(){let t={};return this.intensity!==1&&(t.intensity=this.intensity),this.bias!==0&&(t.bias=this.bias),this.normalBias!==0&&(t.normalBias=this.normalBias),this.radius!==1&&(t.radius=this.radius),(this.mapSize.x!==512||this.mapSize.y!==512)&&(t.mapSize=this.mapSize.toArray()),t.camera=this.camera.toJSON(!1).object,delete t.camera.matrix,t}};var Qs=class extends Hs{constructor(t=-1,e=1,n=1,s=-1,r=.1,a=2e3){super(),this.isOrthographicCamera=!0,this.type="OrthographicCamera",this.zoom=1,this.view=null,this.left=t,this.right=e,this.top=n,this.bottom=s,this.near=r,this.far=a,this.updateProjectionMatrix()}copy(t,e){return super.copy(t,e),this.left=t.left,this.right=t.right,this.top=t.top,this.bottom=t.bottom,this.near=t.near,this.far=t.far,this.zoom=t.zoom,this.view=t.view===null?null:Object.assign({},t.view),this}setViewOffset(t,e,n,s,r,a){this.view===null&&(this.view={enabled:!0,fullWidth:1,fullHeight:1,offsetX:0,offsetY:0,width:1,height:1}),this.view.enabled=!0,this.view.fullWidth=t,this.view.fullHeight=e,this.view.offsetX=n,this.view.offsetY=s,this.view.width=r,this.view.height=a,this.updateProjectionMatrix()}clearViewOffset(){this.view!==null&&(this.view.enabled=!1),this.updateProjectionMatrix()}updateProjectionMatrix(){let t=(this.right-this.left)/(2*this.zoom),e=(this.top-this.bottom)/(2*this.zoom),n=(this.right+this.left)/2,s=(this.top+this.bottom)/2,r=n-t,a=n+t,o=s+e,l=s-e;if(this.view!==null&&this.view.enabled){let c=(this.right-this.left)/this.view.fullWidth/this.zoom,u=(this.top-this.bottom)/this.view.fullHeight/this.zoom;r+=c*this.view.offsetX,a=r+c*this.view.width,o-=u*this.view.offsetY,l=o-u*this.view.height}this.projectionMatrix.makeOrthographic(r,a,o,l,this.near,this.far,this.coordinateSystem,this.reversedDepth),this.projectionMatrixInverse.copy(this.projectionMatrix).invert()}toJSON(t){let e=super.toJSON(t);return e.object.zoom=this.zoom,e.object.left=this.left,e.object.right=this.right,e.object.top=this.top,e.object.bottom=this.bottom,e.object.near=this.near,e.object.far=this.far,this.view!==null&&(e.object.view=Object.assign({},this.view)),e}},ul=class extends dl{constructor(){super(new Qs(-5,5,5,-5,.5,500)),this.isDirectionalLightShadow=!0}},Ti=class extends Ks{constructor(t,e){super(t,e),this.isDirectionalLight=!0,this.type="DirectionalLight",this.position.copy(Ee.DEFAULT_UP),this.updateMatrix(),this.target=new Ee,this.shadow=new ul}dispose(){this.shadow.dispose()}copy(t){return super.copy(t),this.target=t.target.clone(),this.shadow=t.shadow.clone(),this}};var ga=class extends Ne{constructor(t=[]){super(),this.isArrayCamera=!0,this.isMultiViewCamera=!1,this.cameras=t}};var Fl="\\[\\]\\.:\\/",Hu=new RegExp("["+Fl+"]","g"),Ol="[^"+Fl+"]",Gu="[^"+Fl.replace("\\.","")+"]",Wu=/((?:WC+[\/:])*)/.source.replace("WC",Ol),Xu=/(WCOD+)?/.source.replace("WCOD",Gu),$u=/(?:\.(WC+)(?:\[(.+)\])?)?/.source.replace("WC",Ol),qu=/\.(WC+)(?:\[(.+)\])?/.source.replace("WC",Ol),Yu=new RegExp("^"+Wu+Xu+$u+qu+"$"),Zu=["material","materials","bones","map"],pl=class{constructor(t,e,n){let s=n||se.parseTrackName(e);this._targetGroup=t,this._bindings=t.subscribe_(e,s)}getValue(t,e){this.bind();let n=this._targetGroup.nCachedObjects_,s=this._bindings[n];s!==void 0&&s.getValue(t,e)}setValue(t,e){let n=this._bindings;for(let s=this._targetGroup.nCachedObjects_,r=n.length;s!==r;++s)n[s].setValue(t,e)}bind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].bind()}unbind(){let t=this._bindings;for(let e=this._targetGroup.nCachedObjects_,n=t.length;e!==n;++e)t[e].unbind()}},se=class i{constructor(t,e,n){this.path=e,this.parsedPath=n||i.parseTrackName(e),this.node=i.findNode(t,this.parsedPath.nodeName),this.rootNode=t,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}static create(t,e,n){return t&&t.isAnimationObjectGroup?new i.Composite(t,e,n):new i(t,e,n)}static sanitizeNodeName(t){return t.replace(/\s/g,"_").replace(Hu,"")}static parseTrackName(t){let e=Yu.exec(t);if(e===null)throw new Error("PropertyBinding: Cannot parse trackName: "+t);let n={nodeName:e[2],objectName:e[3],objectIndex:e[4],propertyName:e[5],propertyIndex:e[6]},s=n.nodeName&&n.nodeName.lastIndexOf(".");if(s!==void 0&&s!==-1){let r=n.nodeName.substring(s+1);Zu.indexOf(r)!==-1&&(n.nodeName=n.nodeName.substring(0,s),n.objectName=r)}if(n.propertyName===null||n.propertyName.length===0)throw new Error("PropertyBinding: can not parse propertyName from trackName: "+t);return n}static findNode(t,e){if(e===void 0||e===""||e==="."||e===-1||e===t.name||e===t.uuid)return t;if(t.skeleton){let n=t.skeleton.getBoneByName(e);if(n!==void 0)return n}if(t.children){let n=function(r){for(let a=0;a<r.length;a++){let o=r[a];if(o.name===e||o.uuid===e)return o;let l=n(o.children);if(l)return l}return null},s=n(t.children);if(s)return s}return null}_getValue_unavailable(){}_setValue_unavailable(){}_getValue_direct(t,e){t[e]=this.targetObject[this.propertyName]}_getValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)t[e++]=n[s]}_getValue_arrayElement(t,e){t[e]=this.resolvedProperty[this.propertyIndex]}_getValue_toArray(t,e){this.resolvedProperty.toArray(t,e)}_setValue_direct(t,e){this.targetObject[this.propertyName]=t[e]}_setValue_direct_setNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.needsUpdate=!0}_setValue_direct_setMatrixWorldNeedsUpdate(t,e){this.targetObject[this.propertyName]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_array(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++]}_setValue_array_setNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.needsUpdate=!0}_setValue_array_setMatrixWorldNeedsUpdate(t,e){let n=this.resolvedProperty;for(let s=0,r=n.length;s!==r;++s)n[s]=t[e++];this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_arrayElement(t,e){this.resolvedProperty[this.propertyIndex]=t[e]}_setValue_arrayElement_setNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.needsUpdate=!0}_setValue_arrayElement_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty[this.propertyIndex]=t[e],this.targetObject.matrixWorldNeedsUpdate=!0}_setValue_fromArray(t,e){this.resolvedProperty.fromArray(t,e)}_setValue_fromArray_setNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.needsUpdate=!0}_setValue_fromArray_setMatrixWorldNeedsUpdate(t,e){this.resolvedProperty.fromArray(t,e),this.targetObject.matrixWorldNeedsUpdate=!0}_getValue_unbound(t,e){this.bind(),this.getValue(t,e)}_setValue_unbound(t,e){this.bind(),this.setValue(t,e)}bind(){let t=this.node,e=this.parsedPath,n=e.objectName,s=e.propertyName,r=e.propertyIndex;if(t||(t=i.findNode(this.rootNode,e.nodeName),this.node=t),this.getValue=this._getValue_unavailable,this.setValue=this._setValue_unavailable,!t){console.warn("THREE.PropertyBinding: No target node found for track: "+this.path+".");return}if(n){let c=e.objectIndex;switch(n){case"materials":if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.materials){console.error("THREE.PropertyBinding: Can not bind to material.materials as node.material does not have a materials array.",this);return}t=t.material.materials;break;case"bones":if(!t.skeleton){console.error("THREE.PropertyBinding: Can not bind to bones as node does not have a skeleton.",this);return}t=t.skeleton.bones;for(let u=0;u<t.length;u++)if(t[u].name===c){c=u;break}break;case"map":if("map"in t){t=t.map;break}if(!t.material){console.error("THREE.PropertyBinding: Can not bind to material as node does not have a material.",this);return}if(!t.material.map){console.error("THREE.PropertyBinding: Can not bind to material.map as node.material does not have a map.",this);return}t=t.material.map;break;default:if(t[n]===void 0){console.error("THREE.PropertyBinding: Can not bind to objectName of node undefined.",this);return}t=t[n]}if(c!==void 0){if(t[c]===void 0){console.error("THREE.PropertyBinding: Trying to bind to objectIndex of objectName, but is undefined.",this,t);return}t=t[c]}}let a=t[s];if(a===void 0){let c=e.nodeName;console.error("THREE.PropertyBinding: Trying to update property for track: "+c+"."+s+" but it wasn't found.",t);return}let o=this.Versioning.None;this.targetObject=t,t.isMaterial===!0?o=this.Versioning.NeedsUpdate:t.isObject3D===!0&&(o=this.Versioning.MatrixWorldNeedsUpdate);let l=this.BindingType.Direct;if(r!==void 0){if(s==="morphTargetInfluences"){if(!t.geometry){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.",this);return}if(!t.geometry.morphAttributes){console.error("THREE.PropertyBinding: Can not bind to morphTargetInfluences because node does not have a geometry.morphAttributes.",this);return}t.morphTargetDictionary[r]!==void 0&&(r=t.morphTargetDictionary[r])}l=this.BindingType.ArrayElement,this.resolvedProperty=a,this.propertyIndex=r}else a.fromArray!==void 0&&a.toArray!==void 0?(l=this.BindingType.HasFromToArray,this.resolvedProperty=a):Array.isArray(a)?(l=this.BindingType.EntireArray,this.resolvedProperty=a):this.propertyName=s;this.getValue=this.GetterByBindingType[l],this.setValue=this.SetterByBindingTypeAndVersioning[l][o]}unbind(){this.node=null,this.getValue=this._getValue_unbound,this.setValue=this._setValue_unbound}};se.Composite=pl;se.prototype.BindingType={Direct:0,EntireArray:1,ArrayElement:2,HasFromToArray:3};se.prototype.Versioning={None:0,NeedsUpdate:1,MatrixWorldNeedsUpdate:2};se.prototype.GetterByBindingType=[se.prototype._getValue_direct,se.prototype._getValue_array,se.prototype._getValue_arrayElement,se.prototype._getValue_toArray];se.prototype.SetterByBindingTypeAndVersioning=[[se.prototype._setValue_direct,se.prototype._setValue_direct_setNeedsUpdate,se.prototype._setValue_direct_setMatrixWorldNeedsUpdate],[se.prototype._setValue_array,se.prototype._setValue_array_setNeedsUpdate,se.prototype._setValue_array_setMatrixWorldNeedsUpdate],[se.prototype._setValue_arrayElement,se.prototype._setValue_arrayElement_setNeedsUpdate,se.prototype._setValue_arrayElement_setMatrixWorldNeedsUpdate],[se.prototype._setValue_fromArray,se.prototype._setValue_fromArray_setNeedsUpdate,se.prototype._setValue_fromArray_setMatrixWorldNeedsUpdate]];var ux=new Float32Array(1);var sh=new Jt,tr=class{constructor(t,e,n=0,s=1/0){this.ray=new ii(t,e),this.near=n,this.far=s,this.camera=null,this.layers=new ss,this.params={Mesh:{},Line:{threshold:1},LOD:{},Points:{threshold:1},Sprite:{}}}set(t,e){this.ray.set(t,e)}setFromCamera(t,e){e.isPerspectiveCamera?(this.ray.origin.setFromMatrixPosition(e.matrixWorld),this.ray.direction.set(t.x,t.y,.5).unproject(e).sub(this.ray.origin).normalize(),this.camera=e):e.isOrthographicCamera?(this.ray.origin.set(t.x,t.y,(e.near+e.far)/(e.near-e.far)).unproject(e),this.ray.direction.set(0,0,-1).transformDirection(e.matrixWorld),this.camera=e):console.error("THREE.Raycaster: Unsupported camera type: "+e.type)}setFromXRController(t){return sh.identity().extractRotation(t.matrixWorld),this.ray.origin.setFromMatrixPosition(t.matrixWorld),this.ray.direction.set(0,0,-1).applyMatrix4(sh),this}intersectObject(t,e=!0,n=[]){return fl(t,this,n,e),n.sort(rh),n}intersectObjects(t,e=!0,n=[]){for(let s=0,r=t.length;s<r;s++)fl(t[s],this,n,e);return n.sort(rh),n}};function rh(i,t){return i.distance-t.distance}function fl(i,t,e,n){let s=!0;if(i.layers.test(t.layers)&&i.raycast(t,e)===!1&&(s=!1),s===!0&&n===!0){let r=i.children;for(let a=0,o=r.length;a<o;a++)fl(r[a],t,e,!0)}}var ai=class{constructor(t=1,e=0,n=0){this.radius=t,this.phi=e,this.theta=n}set(t,e,n){return this.radius=t,this.phi=e,this.theta=n,this}copy(t){return this.radius=t.radius,this.phi=t.phi,this.theta=t.theta,this}makeSafe(){return this.phi=Ht(this.phi,1e-6,Math.PI-1e-6),this}setFromVector3(t){return this.setFromCartesianCoords(t.x,t.y,t.z)}setFromCartesianCoords(t,e,n){return this.radius=Math.sqrt(t*t+e*e+n*n),this.radius===0?(this.theta=0,this.phi=0):(this.theta=Math.atan2(t,n),this.phi=Math.acos(Ht(e/this.radius,-1,1))),this}clone(){return new this.constructor().copy(this)}};var er=class extends sa{constructor(t=10,e=10,n=4473924,s=8947848){n=new kt(n),s=new kt(s);let r=e/2,a=t/e,o=t/2,l=[],c=[];for(let h=0,f=0,_=-o;h<=e;h++,_+=a){l.push(-o,0,_,o,0,_),l.push(_,0,-o,_,0,o);let y=h===r?n:s;y.toArray(c,f),f+=3,y.toArray(c,f),f+=3,y.toArray(c,f),f+=3,y.toArray(c,f),f+=3}let u=new $e;u.setAttribute("position",new Ge(l,3)),u.setAttribute("color",new Ge(c,3));let d=new qs({vertexColors:!0,toneMapped:!1});super(u,d),this.type="GridHelper"}dispose(){this.geometry.dispose(),this.material.dispose()}};var nr=class extends wn{constructor(t,e=null){super(),this.object=t,this.domElement=e,this.enabled=!0,this.state=-1,this.keys={},this.mouseButtons={LEFT:null,MIDDLE:null,RIGHT:null},this.touches={ONE:null,TWO:null}}connect(t){if(t===void 0){console.warn("THREE.Controls: connect() now requires an element.");return}this.domElement!==null&&this.disconnect(),this.domElement=t}disconnect(){}dispose(){}update(){}};function Bl(i,t,e,n){let s=Ju(n);switch(e){case Tl:return i*t;case La:return i*t/s.components*s.byteLength;case Da:return i*t/s.components*s.byteLength;case Cl:return i*t*2/s.components*s.byteLength;case Na:return i*t*2/s.components*s.byteLength;case Al:return i*t*3/s.components*s.byteLength;case on:return i*t*4/s.components*s.byteLength;case Ua:return i*t*4/s.components*s.byteLength;case rr:case ar:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case or:case lr:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Oa:case za:return Math.max(i,16)*Math.max(t,8)/4;case Fa:case Ba:return Math.max(i,8)*Math.max(t,8)/2;case ka:case Va:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*8;case Ha:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Ga:return Math.floor((i+3)/4)*Math.floor((t+3)/4)*16;case Wa:return Math.floor((i+4)/5)*Math.floor((t+3)/4)*16;case Xa:return Math.floor((i+4)/5)*Math.floor((t+4)/5)*16;case $a:return Math.floor((i+5)/6)*Math.floor((t+4)/5)*16;case qa:return Math.floor((i+5)/6)*Math.floor((t+5)/6)*16;case Ya:return Math.floor((i+7)/8)*Math.floor((t+4)/5)*16;case Za:return Math.floor((i+7)/8)*Math.floor((t+5)/6)*16;case Ja:return Math.floor((i+7)/8)*Math.floor((t+7)/8)*16;case Ka:return Math.floor((i+9)/10)*Math.floor((t+4)/5)*16;case ja:return Math.floor((i+9)/10)*Math.floor((t+5)/6)*16;case Qa:return Math.floor((i+9)/10)*Math.floor((t+7)/8)*16;case to:return Math.floor((i+9)/10)*Math.floor((t+9)/10)*16;case eo:return Math.floor((i+11)/12)*Math.floor((t+9)/10)*16;case no:return Math.floor((i+11)/12)*Math.floor((t+11)/12)*16;case io:case so:case ro:return Math.ceil(i/4)*Math.ceil(t/4)*16;case ao:case oo:return Math.ceil(i/4)*Math.ceil(t/4)*8;case lo:case co:return Math.ceil(i/4)*Math.ceil(t/4)*16}throw new Error(`Unable to determine texture byte length for ${e} format.`)}function Ju(i){switch(i){case xn:case Ml:return{byteLength:1,components:1};case cs:case Sl:case hs:return{byteLength:2,components:1};case Pa:case Ia:return{byteLength:2,components:4};case hi:case Ra:case yn:return{byteLength:4,components:1};case wl:case El:return{byteLength:4,components:3}}throw new Error(`Unknown texture type ${i}.`)}typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("register",{detail:{revision:"180"}}));typeof window<"u"&&(window.__THREE__?console.warn("WARNING: Multiple instances of Three.js being imported."):window.__THREE__="180");function yd(){let i=null,t=!1,e=null,n=null;function s(r,a){e(r,a),n=i.requestAnimationFrame(s)}return{start:function(){t!==!0&&e!==null&&(n=i.requestAnimationFrame(s),t=!0)},stop:function(){i.cancelAnimationFrame(n),t=!1},setAnimationLoop:function(r){e=r},setContext:function(r){i=r}}}function ju(i){let t=new WeakMap;function e(o,l){let c=o.array,u=o.usage,d=c.byteLength,h=i.createBuffer();i.bindBuffer(l,h),i.bufferData(l,c,u),o.onUploadCallback();let f;if(c instanceof Float32Array)f=i.FLOAT;else if(typeof Float16Array<"u"&&c instanceof Float16Array)f=i.HALF_FLOAT;else if(c instanceof Uint16Array)o.isFloat16BufferAttribute?f=i.HALF_FLOAT:f=i.UNSIGNED_SHORT;else if(c instanceof Int16Array)f=i.SHORT;else if(c instanceof Uint32Array)f=i.UNSIGNED_INT;else if(c instanceof Int32Array)f=i.INT;else if(c instanceof Int8Array)f=i.BYTE;else if(c instanceof Uint8Array)f=i.UNSIGNED_BYTE;else if(c instanceof Uint8ClampedArray)f=i.UNSIGNED_BYTE;else throw new Error("THREE.WebGLAttributes: Unsupported buffer data format: "+c);return{buffer:h,type:f,bytesPerElement:c.BYTES_PER_ELEMENT,version:o.version,size:d}}function n(o,l,c){let u=l.array,d=l.updateRanges;if(i.bindBuffer(c,o),d.length===0)i.bufferSubData(c,0,u);else{d.sort((f,_)=>f.start-_.start);let h=0;for(let f=1;f<d.length;f++){let _=d[h],y=d[f];y.start<=_.start+_.count+1?_.count=Math.max(_.count,y.start+y.count-_.start):(++h,d[h]=y)}d.length=h+1;for(let f=0,_=d.length;f<_;f++){let y=d[f];i.bufferSubData(c,y.start*u.BYTES_PER_ELEMENT,u,y.start,y.count)}l.clearUpdateRanges()}l.onUploadCallback()}function s(o){return o.isInterleavedBufferAttribute&&(o=o.data),t.get(o)}function r(o){o.isInterleavedBufferAttribute&&(o=o.data);let l=t.get(o);l&&(i.deleteBuffer(l.buffer),t.delete(o))}function a(o,l){if(o.isInterleavedBufferAttribute&&(o=o.data),o.isGLBufferAttribute){let u=t.get(o);(!u||u.version<o.version)&&t.set(o,{buffer:o.buffer,type:o.type,bytesPerElement:o.elementSize,version:o.version});return}let c=t.get(o);if(c===void 0)t.set(o,e(o,l));else if(c.version<o.version){if(c.size!==o.array.byteLength)throw new Error("THREE.WebGLAttributes: The size of the buffer attribute's array buffer does not match the original size. Resizing buffer attributes is not supported.");n(c.buffer,o,l),c.version=o.version}}return{get:s,remove:r,update:a}}var Qu=`#ifdef USE_ALPHAHASH
	if ( diffuseColor.a < getAlphaHashThreshold( vPosition ) ) discard;
#endif`,tp=`#ifdef USE_ALPHAHASH
	const float ALPHA_HASH_SCALE = 0.05;
	float hash2D( vec2 value ) {
		return fract( 1.0e4 * sin( 17.0 * value.x + 0.1 * value.y ) * ( 0.1 + abs( sin( 13.0 * value.y + value.x ) ) ) );
	}
	float hash3D( vec3 value ) {
		return hash2D( vec2( hash2D( value.xy ), value.z ) );
	}
	float getAlphaHashThreshold( vec3 position ) {
		float maxDeriv = max(
			length( dFdx( position.xyz ) ),
			length( dFdy( position.xyz ) )
		);
		float pixScale = 1.0 / ( ALPHA_HASH_SCALE * maxDeriv );
		vec2 pixScales = vec2(
			exp2( floor( log2( pixScale ) ) ),
			exp2( ceil( log2( pixScale ) ) )
		);
		vec2 alpha = vec2(
			hash3D( floor( pixScales.x * position.xyz ) ),
			hash3D( floor( pixScales.y * position.xyz ) )
		);
		float lerpFactor = fract( log2( pixScale ) );
		float x = ( 1.0 - lerpFactor ) * alpha.x + lerpFactor * alpha.y;
		float a = min( lerpFactor, 1.0 - lerpFactor );
		vec3 cases = vec3(
			x * x / ( 2.0 * a * ( 1.0 - a ) ),
			( x - 0.5 * a ) / ( 1.0 - a ),
			1.0 - ( ( 1.0 - x ) * ( 1.0 - x ) / ( 2.0 * a * ( 1.0 - a ) ) )
		);
		float threshold = ( x < ( 1.0 - a ) )
			? ( ( x < a ) ? cases.x : cases.y )
			: cases.z;
		return clamp( threshold , 1.0e-6, 1.0 );
	}
#endif`,ep=`#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, vAlphaMapUv ).g;
#endif`,np=`#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,ip=`#ifdef USE_ALPHATEST
	#ifdef ALPHA_TO_COVERAGE
	diffuseColor.a = smoothstep( alphaTest, alphaTest + fwidth( diffuseColor.a ), diffuseColor.a );
	if ( diffuseColor.a == 0.0 ) discard;
	#else
	if ( diffuseColor.a < alphaTest ) discard;
	#endif
#endif`,sp=`#ifdef USE_ALPHATEST
	uniform float alphaTest;
#endif`,rp=`#ifdef USE_AOMAP
	float ambientOcclusion = ( texture2D( aoMap, vAoMapUv ).r - 1.0 ) * aoMapIntensity + 1.0;
	reflectedLight.indirectDiffuse *= ambientOcclusion;
	#if defined( USE_CLEARCOAT ) 
		clearcoatSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_SHEEN ) 
		sheenSpecularIndirect *= ambientOcclusion;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD )
		float dotNV = saturate( dot( geometryNormal, geometryViewDir ) );
		reflectedLight.indirectSpecular *= computeSpecularOcclusion( dotNV, ambientOcclusion, material.roughness );
	#endif
#endif`,ap=`#ifdef USE_AOMAP
	uniform sampler2D aoMap;
	uniform float aoMapIntensity;
#endif`,op=`#ifdef USE_BATCHING
	#if ! defined( GL_ANGLE_multi_draw )
	#define gl_DrawID _gl_DrawID
	uniform int _gl_DrawID;
	#endif
	uniform highp sampler2D batchingTexture;
	uniform highp usampler2D batchingIdTexture;
	mat4 getBatchingMatrix( const in float i ) {
		int size = textureSize( batchingTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( batchingTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( batchingTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( batchingTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( batchingTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
	float getIndirectIndex( const in int i ) {
		int size = textureSize( batchingIdTexture, 0 ).x;
		int x = i % size;
		int y = i / size;
		return float( texelFetch( batchingIdTexture, ivec2( x, y ), 0 ).r );
	}
#endif
#ifdef USE_BATCHING_COLOR
	uniform sampler2D batchingColorTexture;
	vec3 getBatchingColor( const in float i ) {
		int size = textureSize( batchingColorTexture, 0 ).x;
		int j = int( i );
		int x = j % size;
		int y = j / size;
		return texelFetch( batchingColorTexture, ivec2( x, y ), 0 ).rgb;
	}
#endif`,lp=`#ifdef USE_BATCHING
	mat4 batchingMatrix = getBatchingMatrix( getIndirectIndex( gl_DrawID ) );
#endif`,cp=`vec3 transformed = vec3( position );
#ifdef USE_ALPHAHASH
	vPosition = vec3( position );
#endif`,hp=`vec3 objectNormal = vec3( normal );
#ifdef USE_TANGENT
	vec3 objectTangent = vec3( tangent.xyz );
#endif`,dp=`float G_BlinnPhong_Implicit( ) {
	return 0.25;
}
float D_BlinnPhong( const in float shininess, const in float dotNH ) {
	return RECIPROCAL_PI * ( shininess * 0.5 + 1.0 ) * pow( dotNH, shininess );
}
vec3 BRDF_BlinnPhong( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in vec3 specularColor, const in float shininess ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( specularColor, 1.0, dotVH );
	float G = G_BlinnPhong_Implicit( );
	float D = D_BlinnPhong( shininess, dotNH );
	return F * ( G * D );
} // validated`,up=`#ifdef USE_IRIDESCENCE
	const mat3 XYZ_TO_REC709 = mat3(
		 3.2404542, -0.9692660,  0.0556434,
		-1.5371385,  1.8760108, -0.2040259,
		-0.4985314,  0.0415560,  1.0572252
	);
	vec3 Fresnel0ToIor( vec3 fresnel0 ) {
		vec3 sqrtF0 = sqrt( fresnel0 );
		return ( vec3( 1.0 ) + sqrtF0 ) / ( vec3( 1.0 ) - sqrtF0 );
	}
	vec3 IorToFresnel0( vec3 transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - vec3( incidentIor ) ) / ( transmittedIor + vec3( incidentIor ) ) );
	}
	float IorToFresnel0( float transmittedIor, float incidentIor ) {
		return pow2( ( transmittedIor - incidentIor ) / ( transmittedIor + incidentIor ));
	}
	vec3 evalSensitivity( float OPD, vec3 shift ) {
		float phase = 2.0 * PI * OPD * 1.0e-9;
		vec3 val = vec3( 5.4856e-13, 4.4201e-13, 5.2481e-13 );
		vec3 pos = vec3( 1.6810e+06, 1.7953e+06, 2.2084e+06 );
		vec3 var = vec3( 4.3278e+09, 9.3046e+09, 6.6121e+09 );
		vec3 xyz = val * sqrt( 2.0 * PI * var ) * cos( pos * phase + shift ) * exp( - pow2( phase ) * var );
		xyz.x += 9.7470e-14 * sqrt( 2.0 * PI * 4.5282e+09 ) * cos( 2.2399e+06 * phase + shift[ 0 ] ) * exp( - 4.5282e+09 * pow2( phase ) );
		xyz /= 1.0685e-7;
		vec3 rgb = XYZ_TO_REC709 * xyz;
		return rgb;
	}
	vec3 evalIridescence( float outsideIOR, float eta2, float cosTheta1, float thinFilmThickness, vec3 baseF0 ) {
		vec3 I;
		float iridescenceIOR = mix( outsideIOR, eta2, smoothstep( 0.0, 0.03, thinFilmThickness ) );
		float sinTheta2Sq = pow2( outsideIOR / iridescenceIOR ) * ( 1.0 - pow2( cosTheta1 ) );
		float cosTheta2Sq = 1.0 - sinTheta2Sq;
		if ( cosTheta2Sq < 0.0 ) {
			return vec3( 1.0 );
		}
		float cosTheta2 = sqrt( cosTheta2Sq );
		float R0 = IorToFresnel0( iridescenceIOR, outsideIOR );
		float R12 = F_Schlick( R0, 1.0, cosTheta1 );
		float T121 = 1.0 - R12;
		float phi12 = 0.0;
		if ( iridescenceIOR < outsideIOR ) phi12 = PI;
		float phi21 = PI - phi12;
		vec3 baseIOR = Fresnel0ToIor( clamp( baseF0, 0.0, 0.9999 ) );		vec3 R1 = IorToFresnel0( baseIOR, iridescenceIOR );
		vec3 R23 = F_Schlick( R1, 1.0, cosTheta2 );
		vec3 phi23 = vec3( 0.0 );
		if ( baseIOR[ 0 ] < iridescenceIOR ) phi23[ 0 ] = PI;
		if ( baseIOR[ 1 ] < iridescenceIOR ) phi23[ 1 ] = PI;
		if ( baseIOR[ 2 ] < iridescenceIOR ) phi23[ 2 ] = PI;
		float OPD = 2.0 * iridescenceIOR * thinFilmThickness * cosTheta2;
		vec3 phi = vec3( phi21 ) + phi23;
		vec3 R123 = clamp( R12 * R23, 1e-5, 0.9999 );
		vec3 r123 = sqrt( R123 );
		vec3 Rs = pow2( T121 ) * R23 / ( vec3( 1.0 ) - R123 );
		vec3 C0 = R12 + Rs;
		I = C0;
		vec3 Cm = Rs - T121;
		for ( int m = 1; m <= 2; ++ m ) {
			Cm *= r123;
			vec3 Sm = 2.0 * evalSensitivity( float( m ) * OPD, float( m ) * phi );
			I += Cm * Sm;
		}
		return max( I, vec3( 0.0 ) );
	}
#endif`,pp=`#ifdef USE_BUMPMAP
	uniform sampler2D bumpMap;
	uniform float bumpScale;
	vec2 dHdxy_fwd() {
		vec2 dSTdx = dFdx( vBumpMapUv );
		vec2 dSTdy = dFdy( vBumpMapUv );
		float Hll = bumpScale * texture2D( bumpMap, vBumpMapUv ).x;
		float dBx = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdx ).x - Hll;
		float dBy = bumpScale * texture2D( bumpMap, vBumpMapUv + dSTdy ).x - Hll;
		return vec2( dBx, dBy );
	}
	vec3 perturbNormalArb( vec3 surf_pos, vec3 surf_norm, vec2 dHdxy, float faceDirection ) {
		vec3 vSigmaX = normalize( dFdx( surf_pos.xyz ) );
		vec3 vSigmaY = normalize( dFdy( surf_pos.xyz ) );
		vec3 vN = surf_norm;
		vec3 R1 = cross( vSigmaY, vN );
		vec3 R2 = cross( vN, vSigmaX );
		float fDet = dot( vSigmaX, R1 ) * faceDirection;
		vec3 vGrad = sign( fDet ) * ( dHdxy.x * R1 + dHdxy.y * R2 );
		return normalize( abs( fDet ) * surf_norm - vGrad );
	}
#endif`,fp=`#if NUM_CLIPPING_PLANES > 0
	vec4 plane;
	#ifdef ALPHA_TO_COVERAGE
		float distanceToPlane, distanceGradient;
		float clipOpacity = 1.0;
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
			distanceGradient = fwidth( distanceToPlane ) / 2.0;
			clipOpacity *= smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			if ( clipOpacity == 0.0 ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			float unionClipOpacity = 1.0;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				distanceToPlane = - dot( vClipPosition, plane.xyz ) + plane.w;
				distanceGradient = fwidth( distanceToPlane ) / 2.0;
				unionClipOpacity *= 1.0 - smoothstep( - distanceGradient, distanceGradient, distanceToPlane );
			}
			#pragma unroll_loop_end
			clipOpacity *= 1.0 - unionClipOpacity;
		#endif
		diffuseColor.a *= clipOpacity;
		if ( diffuseColor.a == 0.0 ) discard;
	#else
		#pragma unroll_loop_start
		for ( int i = 0; i < UNION_CLIPPING_PLANES; i ++ ) {
			plane = clippingPlanes[ i ];
			if ( dot( vClipPosition, plane.xyz ) > plane.w ) discard;
		}
		#pragma unroll_loop_end
		#if UNION_CLIPPING_PLANES < NUM_CLIPPING_PLANES
			bool clipped = true;
			#pragma unroll_loop_start
			for ( int i = UNION_CLIPPING_PLANES; i < NUM_CLIPPING_PLANES; i ++ ) {
				plane = clippingPlanes[ i ];
				clipped = ( dot( vClipPosition, plane.xyz ) > plane.w ) && clipped;
			}
			#pragma unroll_loop_end
			if ( clipped ) discard;
		#endif
	#endif
#endif`,mp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
	uniform vec4 clippingPlanes[ NUM_CLIPPING_PLANES ];
#endif`,gp=`#if NUM_CLIPPING_PLANES > 0
	varying vec3 vClipPosition;
#endif`,_p=`#if NUM_CLIPPING_PLANES > 0
	vClipPosition = - mvPosition.xyz;
#endif`,xp=`#if defined( USE_COLOR_ALPHA )
	diffuseColor *= vColor;
#elif defined( USE_COLOR )
	diffuseColor.rgb *= vColor;
#endif`,yp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR )
	varying vec3 vColor;
#endif`,vp=`#if defined( USE_COLOR_ALPHA )
	varying vec4 vColor;
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	varying vec3 vColor;
#endif`,bp=`#if defined( USE_COLOR_ALPHA )
	vColor = vec4( 1.0 );
#elif defined( USE_COLOR ) || defined( USE_INSTANCING_COLOR ) || defined( USE_BATCHING_COLOR )
	vColor = vec3( 1.0 );
#endif
#ifdef USE_COLOR
	vColor *= color;
#endif
#ifdef USE_INSTANCING_COLOR
	vColor.xyz *= instanceColor.xyz;
#endif
#ifdef USE_BATCHING_COLOR
	vec3 batchingColor = getBatchingColor( getIndirectIndex( gl_DrawID ) );
	vColor.xyz *= batchingColor.xyz;
#endif`,Mp=`#define PI 3.141592653589793
#define PI2 6.283185307179586
#define PI_HALF 1.5707963267948966
#define RECIPROCAL_PI 0.3183098861837907
#define RECIPROCAL_PI2 0.15915494309189535
#define EPSILON 1e-6
#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
#define whiteComplement( a ) ( 1.0 - saturate( a ) )
float pow2( const in float x ) { return x*x; }
vec3 pow2( const in vec3 x ) { return x*x; }
float pow3( const in float x ) { return x*x*x; }
float pow4( const in float x ) { float x2 = x*x; return x2*x2; }
float max3( const in vec3 v ) { return max( max( v.x, v.y ), v.z ); }
float average( const in vec3 v ) { return dot( v, vec3( 0.3333333 ) ); }
highp float rand( const in vec2 uv ) {
	const highp float a = 12.9898, b = 78.233, c = 43758.5453;
	highp float dt = dot( uv.xy, vec2( a,b ) ), sn = mod( dt, PI );
	return fract( sin( sn ) * c );
}
#ifdef HIGH_PRECISION
	float precisionSafeLength( vec3 v ) { return length( v ); }
#else
	float precisionSafeLength( vec3 v ) {
		float maxComponent = max3( abs( v ) );
		return length( v / maxComponent ) * maxComponent;
	}
#endif
struct IncidentLight {
	vec3 color;
	vec3 direction;
	bool visible;
};
struct ReflectedLight {
	vec3 directDiffuse;
	vec3 directSpecular;
	vec3 indirectDiffuse;
	vec3 indirectSpecular;
};
#ifdef USE_ALPHAHASH
	varying vec3 vPosition;
#endif
vec3 transformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( matrix * vec4( dir, 0.0 ) ).xyz );
}
vec3 inverseTransformDirection( in vec3 dir, in mat4 matrix ) {
	return normalize( ( vec4( dir, 0.0 ) * matrix ).xyz );
}
mat3 transposeMat3( const in mat3 m ) {
	mat3 tmp;
	tmp[ 0 ] = vec3( m[ 0 ].x, m[ 1 ].x, m[ 2 ].x );
	tmp[ 1 ] = vec3( m[ 0 ].y, m[ 1 ].y, m[ 2 ].y );
	tmp[ 2 ] = vec3( m[ 0 ].z, m[ 1 ].z, m[ 2 ].z );
	return tmp;
}
bool isPerspectiveMatrix( mat4 m ) {
	return m[ 2 ][ 3 ] == - 1.0;
}
vec2 equirectUv( in vec3 dir ) {
	float u = atan( dir.z, dir.x ) * RECIPROCAL_PI2 + 0.5;
	float v = asin( clamp( dir.y, - 1.0, 1.0 ) ) * RECIPROCAL_PI + 0.5;
	return vec2( u, v );
}
vec3 BRDF_Lambert( const in vec3 diffuseColor ) {
	return RECIPROCAL_PI * diffuseColor;
}
vec3 F_Schlick( const in vec3 f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
}
float F_Schlick( const in float f0, const in float f90, const in float dotVH ) {
	float fresnel = exp2( ( - 5.55473 * dotVH - 6.98316 ) * dotVH );
	return f0 * ( 1.0 - fresnel ) + ( f90 * fresnel );
} // validated`,Sp=`#ifdef ENVMAP_TYPE_CUBE_UV
	#define cubeUV_minMipLevel 4.0
	#define cubeUV_minTileSize 16.0
	float getFace( vec3 direction ) {
		vec3 absDirection = abs( direction );
		float face = - 1.0;
		if ( absDirection.x > absDirection.z ) {
			if ( absDirection.x > absDirection.y )
				face = direction.x > 0.0 ? 0.0 : 3.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		} else {
			if ( absDirection.z > absDirection.y )
				face = direction.z > 0.0 ? 2.0 : 5.0;
			else
				face = direction.y > 0.0 ? 1.0 : 4.0;
		}
		return face;
	}
	vec2 getUV( vec3 direction, float face ) {
		vec2 uv;
		if ( face == 0.0 ) {
			uv = vec2( direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 1.0 ) {
			uv = vec2( - direction.x, - direction.z ) / abs( direction.y );
		} else if ( face == 2.0 ) {
			uv = vec2( - direction.x, direction.y ) / abs( direction.z );
		} else if ( face == 3.0 ) {
			uv = vec2( - direction.z, direction.y ) / abs( direction.x );
		} else if ( face == 4.0 ) {
			uv = vec2( - direction.x, direction.z ) / abs( direction.y );
		} else {
			uv = vec2( direction.x, direction.y ) / abs( direction.z );
		}
		return 0.5 * ( uv + 1.0 );
	}
	vec3 bilinearCubeUV( sampler2D envMap, vec3 direction, float mipInt ) {
		float face = getFace( direction );
		float filterInt = max( cubeUV_minMipLevel - mipInt, 0.0 );
		mipInt = max( mipInt, cubeUV_minMipLevel );
		float faceSize = exp2( mipInt );
		highp vec2 uv = getUV( direction, face ) * ( faceSize - 2.0 ) + 1.0;
		if ( face > 2.0 ) {
			uv.y += faceSize;
			face -= 3.0;
		}
		uv.x += face * faceSize;
		uv.x += filterInt * 3.0 * cubeUV_minTileSize;
		uv.y += 4.0 * ( exp2( CUBEUV_MAX_MIP ) - faceSize );
		uv.x *= CUBEUV_TEXEL_WIDTH;
		uv.y *= CUBEUV_TEXEL_HEIGHT;
		#ifdef texture2DGradEXT
			return texture2DGradEXT( envMap, uv, vec2( 0.0 ), vec2( 0.0 ) ).rgb;
		#else
			return texture2D( envMap, uv ).rgb;
		#endif
	}
	#define cubeUV_r0 1.0
	#define cubeUV_m0 - 2.0
	#define cubeUV_r1 0.8
	#define cubeUV_m1 - 1.0
	#define cubeUV_r4 0.4
	#define cubeUV_m4 2.0
	#define cubeUV_r5 0.305
	#define cubeUV_m5 3.0
	#define cubeUV_r6 0.21
	#define cubeUV_m6 4.0
	float roughnessToMip( float roughness ) {
		float mip = 0.0;
		if ( roughness >= cubeUV_r1 ) {
			mip = ( cubeUV_r0 - roughness ) * ( cubeUV_m1 - cubeUV_m0 ) / ( cubeUV_r0 - cubeUV_r1 ) + cubeUV_m0;
		} else if ( roughness >= cubeUV_r4 ) {
			mip = ( cubeUV_r1 - roughness ) * ( cubeUV_m4 - cubeUV_m1 ) / ( cubeUV_r1 - cubeUV_r4 ) + cubeUV_m1;
		} else if ( roughness >= cubeUV_r5 ) {
			mip = ( cubeUV_r4 - roughness ) * ( cubeUV_m5 - cubeUV_m4 ) / ( cubeUV_r4 - cubeUV_r5 ) + cubeUV_m4;
		} else if ( roughness >= cubeUV_r6 ) {
			mip = ( cubeUV_r5 - roughness ) * ( cubeUV_m6 - cubeUV_m5 ) / ( cubeUV_r5 - cubeUV_r6 ) + cubeUV_m5;
		} else {
			mip = - 2.0 * log2( 1.16 * roughness );		}
		return mip;
	}
	vec4 textureCubeUV( sampler2D envMap, vec3 sampleDir, float roughness ) {
		float mip = clamp( roughnessToMip( roughness ), cubeUV_m0, CUBEUV_MAX_MIP );
		float mipF = fract( mip );
		float mipInt = floor( mip );
		vec3 color0 = bilinearCubeUV( envMap, sampleDir, mipInt );
		if ( mipF == 0.0 ) {
			return vec4( color0, 1.0 );
		} else {
			vec3 color1 = bilinearCubeUV( envMap, sampleDir, mipInt + 1.0 );
			return vec4( mix( color0, color1, mipF ), 1.0 );
		}
	}
#endif`,wp=`vec3 transformedNormal = objectNormal;
#ifdef USE_TANGENT
	vec3 transformedTangent = objectTangent;
#endif
#ifdef USE_BATCHING
	mat3 bm = mat3( batchingMatrix );
	transformedNormal /= vec3( dot( bm[ 0 ], bm[ 0 ] ), dot( bm[ 1 ], bm[ 1 ] ), dot( bm[ 2 ], bm[ 2 ] ) );
	transformedNormal = bm * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = bm * transformedTangent;
	#endif
#endif
#ifdef USE_INSTANCING
	mat3 im = mat3( instanceMatrix );
	transformedNormal /= vec3( dot( im[ 0 ], im[ 0 ] ), dot( im[ 1 ], im[ 1 ] ), dot( im[ 2 ], im[ 2 ] ) );
	transformedNormal = im * transformedNormal;
	#ifdef USE_TANGENT
		transformedTangent = im * transformedTangent;
	#endif
#endif
transformedNormal = normalMatrix * transformedNormal;
#ifdef FLIP_SIDED
	transformedNormal = - transformedNormal;
#endif
#ifdef USE_TANGENT
	transformedTangent = ( modelViewMatrix * vec4( transformedTangent, 0.0 ) ).xyz;
	#ifdef FLIP_SIDED
		transformedTangent = - transformedTangent;
	#endif
#endif`,Ep=`#ifdef USE_DISPLACEMENTMAP
	uniform sampler2D displacementMap;
	uniform float displacementScale;
	uniform float displacementBias;
#endif`,Tp=`#ifdef USE_DISPLACEMENTMAP
	transformed += normalize( objectNormal ) * ( texture2D( displacementMap, vDisplacementMapUv ).x * displacementScale + displacementBias );
#endif`,Ap=`#ifdef USE_EMISSIVEMAP
	vec4 emissiveColor = texture2D( emissiveMap, vEmissiveMapUv );
	#ifdef DECODE_VIDEO_TEXTURE_EMISSIVE
		emissiveColor = sRGBTransferEOTF( emissiveColor );
	#endif
	totalEmissiveRadiance *= emissiveColor.rgb;
#endif`,Cp=`#ifdef USE_EMISSIVEMAP
	uniform sampler2D emissiveMap;
#endif`,Rp="gl_FragColor = linearToOutputTexel( gl_FragColor );",Pp=`vec4 LinearTransferOETF( in vec4 value ) {
	return value;
}
vec4 sRGBTransferEOTF( in vec4 value ) {
	return vec4( mix( pow( value.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), value.rgb * 0.0773993808, vec3( lessThanEqual( value.rgb, vec3( 0.04045 ) ) ) ), value.a );
}
vec4 sRGBTransferOETF( in vec4 value ) {
	return vec4( mix( pow( value.rgb, vec3( 0.41666 ) ) * 1.055 - vec3( 0.055 ), value.rgb * 12.92, vec3( lessThanEqual( value.rgb, vec3( 0.0031308 ) ) ) ), value.a );
}`,Ip=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vec3 cameraToFrag;
		if ( isOrthographic ) {
			cameraToFrag = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToFrag = normalize( vWorldPosition - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vec3 reflectVec = reflect( cameraToFrag, worldNormal );
		#else
			vec3 reflectVec = refract( cameraToFrag, worldNormal, refractionRatio );
		#endif
	#else
		vec3 reflectVec = vReflect;
	#endif
	#ifdef ENVMAP_TYPE_CUBE
		vec4 envColor = textureCube( envMap, envMapRotation * vec3( flipEnvMap * reflectVec.x, reflectVec.yz ) );
	#else
		vec4 envColor = vec4( 0.0 );
	#endif
	#ifdef ENVMAP_BLENDING_MULTIPLY
		outgoingLight = mix( outgoingLight, outgoingLight * envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_MIX )
		outgoingLight = mix( outgoingLight, envColor.xyz, specularStrength * reflectivity );
	#elif defined( ENVMAP_BLENDING_ADD )
		outgoingLight += envColor.xyz * specularStrength * reflectivity;
	#endif
#endif`,Lp=`#ifdef USE_ENVMAP
	uniform float envMapIntensity;
	uniform float flipEnvMap;
	uniform mat3 envMapRotation;
	#ifdef ENVMAP_TYPE_CUBE
		uniform samplerCube envMap;
	#else
		uniform sampler2D envMap;
	#endif
	
#endif`,Dp=`#ifdef USE_ENVMAP
	uniform float reflectivity;
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		varying vec3 vWorldPosition;
		uniform float refractionRatio;
	#else
		varying vec3 vReflect;
	#endif
#endif`,Np=`#ifdef USE_ENVMAP
	#if defined( USE_BUMPMAP ) || defined( USE_NORMALMAP ) || defined( PHONG ) || defined( LAMBERT )
		#define ENV_WORLDPOS
	#endif
	#ifdef ENV_WORLDPOS
		
		varying vec3 vWorldPosition;
	#else
		varying vec3 vReflect;
		uniform float refractionRatio;
	#endif
#endif`,Up=`#ifdef USE_ENVMAP
	#ifdef ENV_WORLDPOS
		vWorldPosition = worldPosition.xyz;
	#else
		vec3 cameraToVertex;
		if ( isOrthographic ) {
			cameraToVertex = normalize( vec3( - viewMatrix[ 0 ][ 2 ], - viewMatrix[ 1 ][ 2 ], - viewMatrix[ 2 ][ 2 ] ) );
		} else {
			cameraToVertex = normalize( worldPosition.xyz - cameraPosition );
		}
		vec3 worldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
		#ifdef ENVMAP_MODE_REFLECTION
			vReflect = reflect( cameraToVertex, worldNormal );
		#else
			vReflect = refract( cameraToVertex, worldNormal, refractionRatio );
		#endif
	#endif
#endif`,Fp=`#ifdef USE_FOG
	vFogDepth = - mvPosition.z;
#endif`,Op=`#ifdef USE_FOG
	varying float vFogDepth;
#endif`,Bp=`#ifdef USE_FOG
	#ifdef FOG_EXP2
		float fogFactor = 1.0 - exp( - fogDensity * fogDensity * vFogDepth * vFogDepth );
	#else
		float fogFactor = smoothstep( fogNear, fogFar, vFogDepth );
	#endif
	gl_FragColor.rgb = mix( gl_FragColor.rgb, fogColor, fogFactor );
#endif`,zp=`#ifdef USE_FOG
	uniform vec3 fogColor;
	varying float vFogDepth;
	#ifdef FOG_EXP2
		uniform float fogDensity;
	#else
		uniform float fogNear;
		uniform float fogFar;
	#endif
#endif`,kp=`#ifdef USE_GRADIENTMAP
	uniform sampler2D gradientMap;
#endif
vec3 getGradientIrradiance( vec3 normal, vec3 lightDirection ) {
	float dotNL = dot( normal, lightDirection );
	vec2 coord = vec2( dotNL * 0.5 + 0.5, 0.0 );
	#ifdef USE_GRADIENTMAP
		return vec3( texture2D( gradientMap, coord ).r );
	#else
		vec2 fw = fwidth( coord ) * 0.5;
		return mix( vec3( 0.7 ), vec3( 1.0 ), smoothstep( 0.7 - fw.x, 0.7 + fw.x, coord.x ) );
	#endif
}`,Vp=`#ifdef USE_LIGHTMAP
	uniform sampler2D lightMap;
	uniform float lightMapIntensity;
#endif`,Hp=`LambertMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularStrength = specularStrength;`,Gp=`varying vec3 vViewPosition;
struct LambertMaterial {
	vec3 diffuseColor;
	float specularStrength;
};
void RE_Direct_Lambert( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Lambert( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in LambertMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Lambert
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Lambert`,Wp=`uniform bool receiveShadow;
uniform vec3 ambientLightColor;
#if defined( USE_LIGHT_PROBES )
	uniform vec3 lightProbe[ 9 ];
#endif
vec3 shGetIrradianceAt( in vec3 normal, in vec3 shCoefficients[ 9 ] ) {
	float x = normal.x, y = normal.y, z = normal.z;
	vec3 result = shCoefficients[ 0 ] * 0.886227;
	result += shCoefficients[ 1 ] * 2.0 * 0.511664 * y;
	result += shCoefficients[ 2 ] * 2.0 * 0.511664 * z;
	result += shCoefficients[ 3 ] * 2.0 * 0.511664 * x;
	result += shCoefficients[ 4 ] * 2.0 * 0.429043 * x * y;
	result += shCoefficients[ 5 ] * 2.0 * 0.429043 * y * z;
	result += shCoefficients[ 6 ] * ( 0.743125 * z * z - 0.247708 );
	result += shCoefficients[ 7 ] * 2.0 * 0.429043 * x * z;
	result += shCoefficients[ 8 ] * 0.429043 * ( x * x - y * y );
	return result;
}
vec3 getLightProbeIrradiance( const in vec3 lightProbe[ 9 ], const in vec3 normal ) {
	vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
	vec3 irradiance = shGetIrradianceAt( worldNormal, lightProbe );
	return irradiance;
}
vec3 getAmbientLightIrradiance( const in vec3 ambientLightColor ) {
	vec3 irradiance = ambientLightColor;
	return irradiance;
}
float getDistanceAttenuation( const in float lightDistance, const in float cutoffDistance, const in float decayExponent ) {
	float distanceFalloff = 1.0 / max( pow( lightDistance, decayExponent ), 0.01 );
	if ( cutoffDistance > 0.0 ) {
		distanceFalloff *= pow2( saturate( 1.0 - pow4( lightDistance / cutoffDistance ) ) );
	}
	return distanceFalloff;
}
float getSpotAttenuation( const in float coneCosine, const in float penumbraCosine, const in float angleCosine ) {
	return smoothstep( coneCosine, penumbraCosine, angleCosine );
}
#if NUM_DIR_LIGHTS > 0
	struct DirectionalLight {
		vec3 direction;
		vec3 color;
	};
	uniform DirectionalLight directionalLights[ NUM_DIR_LIGHTS ];
	void getDirectionalLightInfo( const in DirectionalLight directionalLight, out IncidentLight light ) {
		light.color = directionalLight.color;
		light.direction = directionalLight.direction;
		light.visible = true;
	}
#endif
#if NUM_POINT_LIGHTS > 0
	struct PointLight {
		vec3 position;
		vec3 color;
		float distance;
		float decay;
	};
	uniform PointLight pointLights[ NUM_POINT_LIGHTS ];
	void getPointLightInfo( const in PointLight pointLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = pointLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float lightDistance = length( lVector );
		light.color = pointLight.color;
		light.color *= getDistanceAttenuation( lightDistance, pointLight.distance, pointLight.decay );
		light.visible = ( light.color != vec3( 0.0 ) );
	}
#endif
#if NUM_SPOT_LIGHTS > 0
	struct SpotLight {
		vec3 position;
		vec3 direction;
		vec3 color;
		float distance;
		float decay;
		float coneCos;
		float penumbraCos;
	};
	uniform SpotLight spotLights[ NUM_SPOT_LIGHTS ];
	void getSpotLightInfo( const in SpotLight spotLight, const in vec3 geometryPosition, out IncidentLight light ) {
		vec3 lVector = spotLight.position - geometryPosition;
		light.direction = normalize( lVector );
		float angleCos = dot( light.direction, spotLight.direction );
		float spotAttenuation = getSpotAttenuation( spotLight.coneCos, spotLight.penumbraCos, angleCos );
		if ( spotAttenuation > 0.0 ) {
			float lightDistance = length( lVector );
			light.color = spotLight.color * spotAttenuation;
			light.color *= getDistanceAttenuation( lightDistance, spotLight.distance, spotLight.decay );
			light.visible = ( light.color != vec3( 0.0 ) );
		} else {
			light.color = vec3( 0.0 );
			light.visible = false;
		}
	}
#endif
#if NUM_RECT_AREA_LIGHTS > 0
	struct RectAreaLight {
		vec3 color;
		vec3 position;
		vec3 halfWidth;
		vec3 halfHeight;
	};
	uniform sampler2D ltc_1;	uniform sampler2D ltc_2;
	uniform RectAreaLight rectAreaLights[ NUM_RECT_AREA_LIGHTS ];
#endif
#if NUM_HEMI_LIGHTS > 0
	struct HemisphereLight {
		vec3 direction;
		vec3 skyColor;
		vec3 groundColor;
	};
	uniform HemisphereLight hemisphereLights[ NUM_HEMI_LIGHTS ];
	vec3 getHemisphereLightIrradiance( const in HemisphereLight hemiLight, const in vec3 normal ) {
		float dotNL = dot( normal, hemiLight.direction );
		float hemiDiffuseWeight = 0.5 * dotNL + 0.5;
		vec3 irradiance = mix( hemiLight.groundColor, hemiLight.skyColor, hemiDiffuseWeight );
		return irradiance;
	}
#endif`,Xp=`#ifdef USE_ENVMAP
	vec3 getIBLIrradiance( const in vec3 normal ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 worldNormal = inverseTransformDirection( normal, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * worldNormal, 1.0 );
			return PI * envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	vec3 getIBLRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness ) {
		#ifdef ENVMAP_TYPE_CUBE_UV
			vec3 reflectVec = reflect( - viewDir, normal );
			reflectVec = normalize( mix( reflectVec, normal, roughness * roughness) );
			reflectVec = inverseTransformDirection( reflectVec, viewMatrix );
			vec4 envMapColor = textureCubeUV( envMap, envMapRotation * reflectVec, roughness );
			return envMapColor.rgb * envMapIntensity;
		#else
			return vec3( 0.0 );
		#endif
	}
	#ifdef USE_ANISOTROPY
		vec3 getIBLAnisotropyRadiance( const in vec3 viewDir, const in vec3 normal, const in float roughness, const in vec3 bitangent, const in float anisotropy ) {
			#ifdef ENVMAP_TYPE_CUBE_UV
				vec3 bentNormal = cross( bitangent, viewDir );
				bentNormal = normalize( cross( bentNormal, bitangent ) );
				bentNormal = normalize( mix( bentNormal, normal, pow2( pow2( 1.0 - anisotropy * ( 1.0 - roughness ) ) ) ) );
				return getIBLRadiance( viewDir, bentNormal, roughness );
			#else
				return vec3( 0.0 );
			#endif
		}
	#endif
#endif`,$p=`ToonMaterial material;
material.diffuseColor = diffuseColor.rgb;`,qp=`varying vec3 vViewPosition;
struct ToonMaterial {
	vec3 diffuseColor;
};
void RE_Direct_Toon( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	vec3 irradiance = getGradientIrradiance( geometryNormal, directLight.direction ) * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Toon( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in ToonMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_Toon
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Toon`,Yp=`BlinnPhongMaterial material;
material.diffuseColor = diffuseColor.rgb;
material.specularColor = specular;
material.specularShininess = shininess;
material.specularStrength = specularStrength;`,Zp=`varying vec3 vViewPosition;
struct BlinnPhongMaterial {
	vec3 diffuseColor;
	vec3 specularColor;
	float specularShininess;
	float specularStrength;
};
void RE_Direct_BlinnPhong( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
	reflectedLight.directSpecular += irradiance * BRDF_BlinnPhong( directLight.direction, geometryViewDir, geometryNormal, material.specularColor, material.specularShininess ) * material.specularStrength;
}
void RE_IndirectDiffuse_BlinnPhong( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in BlinnPhongMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
#define RE_Direct				RE_Direct_BlinnPhong
#define RE_IndirectDiffuse		RE_IndirectDiffuse_BlinnPhong`,Jp=`PhysicalMaterial material;
material.diffuseColor = diffuseColor.rgb * ( 1.0 - metalnessFactor );
vec3 dxy = max( abs( dFdx( nonPerturbedNormal ) ), abs( dFdy( nonPerturbedNormal ) ) );
float geometryRoughness = max( max( dxy.x, dxy.y ), dxy.z );
material.roughness = max( roughnessFactor, 0.0525 );material.roughness += geometryRoughness;
material.roughness = min( material.roughness, 1.0 );
#ifdef IOR
	material.ior = ior;
	#ifdef USE_SPECULAR
		float specularIntensityFactor = specularIntensity;
		vec3 specularColorFactor = specularColor;
		#ifdef USE_SPECULAR_COLORMAP
			specularColorFactor *= texture2D( specularColorMap, vSpecularColorMapUv ).rgb;
		#endif
		#ifdef USE_SPECULAR_INTENSITYMAP
			specularIntensityFactor *= texture2D( specularIntensityMap, vSpecularIntensityMapUv ).a;
		#endif
		material.specularF90 = mix( specularIntensityFactor, 1.0, metalnessFactor );
	#else
		float specularIntensityFactor = 1.0;
		vec3 specularColorFactor = vec3( 1.0 );
		material.specularF90 = 1.0;
	#endif
	material.specularColor = mix( min( pow2( ( material.ior - 1.0 ) / ( material.ior + 1.0 ) ) * specularColorFactor, vec3( 1.0 ) ) * specularIntensityFactor, diffuseColor.rgb, metalnessFactor );
#else
	material.specularColor = mix( vec3( 0.04 ), diffuseColor.rgb, metalnessFactor );
	material.specularF90 = 1.0;
#endif
#ifdef USE_CLEARCOAT
	material.clearcoat = clearcoat;
	material.clearcoatRoughness = clearcoatRoughness;
	material.clearcoatF0 = vec3( 0.04 );
	material.clearcoatF90 = 1.0;
	#ifdef USE_CLEARCOATMAP
		material.clearcoat *= texture2D( clearcoatMap, vClearcoatMapUv ).x;
	#endif
	#ifdef USE_CLEARCOAT_ROUGHNESSMAP
		material.clearcoatRoughness *= texture2D( clearcoatRoughnessMap, vClearcoatRoughnessMapUv ).y;
	#endif
	material.clearcoat = saturate( material.clearcoat );	material.clearcoatRoughness = max( material.clearcoatRoughness, 0.0525 );
	material.clearcoatRoughness += geometryRoughness;
	material.clearcoatRoughness = min( material.clearcoatRoughness, 1.0 );
#endif
#ifdef USE_DISPERSION
	material.dispersion = dispersion;
#endif
#ifdef USE_IRIDESCENCE
	material.iridescence = iridescence;
	material.iridescenceIOR = iridescenceIOR;
	#ifdef USE_IRIDESCENCEMAP
		material.iridescence *= texture2D( iridescenceMap, vIridescenceMapUv ).r;
	#endif
	#ifdef USE_IRIDESCENCE_THICKNESSMAP
		material.iridescenceThickness = (iridescenceThicknessMaximum - iridescenceThicknessMinimum) * texture2D( iridescenceThicknessMap, vIridescenceThicknessMapUv ).g + iridescenceThicknessMinimum;
	#else
		material.iridescenceThickness = iridescenceThicknessMaximum;
	#endif
#endif
#ifdef USE_SHEEN
	material.sheenColor = sheenColor;
	#ifdef USE_SHEEN_COLORMAP
		material.sheenColor *= texture2D( sheenColorMap, vSheenColorMapUv ).rgb;
	#endif
	material.sheenRoughness = clamp( sheenRoughness, 0.07, 1.0 );
	#ifdef USE_SHEEN_ROUGHNESSMAP
		material.sheenRoughness *= texture2D( sheenRoughnessMap, vSheenRoughnessMapUv ).a;
	#endif
#endif
#ifdef USE_ANISOTROPY
	#ifdef USE_ANISOTROPYMAP
		mat2 anisotropyMat = mat2( anisotropyVector.x, anisotropyVector.y, - anisotropyVector.y, anisotropyVector.x );
		vec3 anisotropyPolar = texture2D( anisotropyMap, vAnisotropyMapUv ).rgb;
		vec2 anisotropyV = anisotropyMat * normalize( 2.0 * anisotropyPolar.rg - vec2( 1.0 ) ) * anisotropyPolar.b;
	#else
		vec2 anisotropyV = anisotropyVector;
	#endif
	material.anisotropy = length( anisotropyV );
	if( material.anisotropy == 0.0 ) {
		anisotropyV = vec2( 1.0, 0.0 );
	} else {
		anisotropyV /= material.anisotropy;
		material.anisotropy = saturate( material.anisotropy );
	}
	material.alphaT = mix( pow2( material.roughness ), 1.0, pow2( material.anisotropy ) );
	material.anisotropyT = tbn[ 0 ] * anisotropyV.x + tbn[ 1 ] * anisotropyV.y;
	material.anisotropyB = tbn[ 1 ] * anisotropyV.x - tbn[ 0 ] * anisotropyV.y;
#endif`,Kp=`struct PhysicalMaterial {
	vec3 diffuseColor;
	float roughness;
	vec3 specularColor;
	float specularF90;
	float dispersion;
	#ifdef USE_CLEARCOAT
		float clearcoat;
		float clearcoatRoughness;
		vec3 clearcoatF0;
		float clearcoatF90;
	#endif
	#ifdef USE_IRIDESCENCE
		float iridescence;
		float iridescenceIOR;
		float iridescenceThickness;
		vec3 iridescenceFresnel;
		vec3 iridescenceF0;
	#endif
	#ifdef USE_SHEEN
		vec3 sheenColor;
		float sheenRoughness;
	#endif
	#ifdef IOR
		float ior;
	#endif
	#ifdef USE_TRANSMISSION
		float transmission;
		float transmissionAlpha;
		float thickness;
		float attenuationDistance;
		vec3 attenuationColor;
	#endif
	#ifdef USE_ANISOTROPY
		float anisotropy;
		float alphaT;
		vec3 anisotropyT;
		vec3 anisotropyB;
	#endif
};
vec3 clearcoatSpecularDirect = vec3( 0.0 );
vec3 clearcoatSpecularIndirect = vec3( 0.0 );
vec3 sheenSpecularDirect = vec3( 0.0 );
vec3 sheenSpecularIndirect = vec3(0.0 );
vec3 Schlick_to_F0( const in vec3 f, const in float f90, const in float dotVH ) {
    float x = clamp( 1.0 - dotVH, 0.0, 1.0 );
    float x2 = x * x;
    float x5 = clamp( x * x2 * x2, 0.0, 0.9999 );
    return ( f - vec3( f90 ) * x5 ) / ( 1.0 - x5 );
}
float V_GGX_SmithCorrelated( const in float alpha, const in float dotNL, const in float dotNV ) {
	float a2 = pow2( alpha );
	float gv = dotNL * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNV ) );
	float gl = dotNV * sqrt( a2 + ( 1.0 - a2 ) * pow2( dotNL ) );
	return 0.5 / max( gv + gl, EPSILON );
}
float D_GGX( const in float alpha, const in float dotNH ) {
	float a2 = pow2( alpha );
	float denom = pow2( dotNH ) * ( a2 - 1.0 ) + 1.0;
	return RECIPROCAL_PI * a2 / pow2( denom );
}
#ifdef USE_ANISOTROPY
	float V_GGX_SmithCorrelated_Anisotropic( const in float alphaT, const in float alphaB, const in float dotTV, const in float dotBV, const in float dotTL, const in float dotBL, const in float dotNV, const in float dotNL ) {
		float gv = dotNL * length( vec3( alphaT * dotTV, alphaB * dotBV, dotNV ) );
		float gl = dotNV * length( vec3( alphaT * dotTL, alphaB * dotBL, dotNL ) );
		float v = 0.5 / ( gv + gl );
		return saturate(v);
	}
	float D_GGX_Anisotropic( const in float alphaT, const in float alphaB, const in float dotNH, const in float dotTH, const in float dotBH ) {
		float a2 = alphaT * alphaB;
		highp vec3 v = vec3( alphaB * dotTH, alphaT * dotBH, a2 * dotNH );
		highp float v2 = dot( v, v );
		float w2 = a2 / v2;
		return RECIPROCAL_PI * a2 * pow2 ( w2 );
	}
#endif
#ifdef USE_CLEARCOAT
	vec3 BRDF_GGX_Clearcoat( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material) {
		vec3 f0 = material.clearcoatF0;
		float f90 = material.clearcoatF90;
		float roughness = material.clearcoatRoughness;
		float alpha = pow2( roughness );
		vec3 halfDir = normalize( lightDir + viewDir );
		float dotNL = saturate( dot( normal, lightDir ) );
		float dotNV = saturate( dot( normal, viewDir ) );
		float dotNH = saturate( dot( normal, halfDir ) );
		float dotVH = saturate( dot( viewDir, halfDir ) );
		vec3 F = F_Schlick( f0, f90, dotVH );
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
		return F * ( V * D );
	}
#endif
vec3 BRDF_GGX( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, const in PhysicalMaterial material ) {
	vec3 f0 = material.specularColor;
	float f90 = material.specularF90;
	float roughness = material.roughness;
	float alpha = pow2( roughness );
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float dotVH = saturate( dot( viewDir, halfDir ) );
	vec3 F = F_Schlick( f0, f90, dotVH );
	#ifdef USE_IRIDESCENCE
		F = mix( F, material.iridescenceFresnel, material.iridescence );
	#endif
	#ifdef USE_ANISOTROPY
		float dotTL = dot( material.anisotropyT, lightDir );
		float dotTV = dot( material.anisotropyT, viewDir );
		float dotTH = dot( material.anisotropyT, halfDir );
		float dotBL = dot( material.anisotropyB, lightDir );
		float dotBV = dot( material.anisotropyB, viewDir );
		float dotBH = dot( material.anisotropyB, halfDir );
		float V = V_GGX_SmithCorrelated_Anisotropic( material.alphaT, alpha, dotTV, dotBV, dotTL, dotBL, dotNV, dotNL );
		float D = D_GGX_Anisotropic( material.alphaT, alpha, dotNH, dotTH, dotBH );
	#else
		float V = V_GGX_SmithCorrelated( alpha, dotNL, dotNV );
		float D = D_GGX( alpha, dotNH );
	#endif
	return F * ( V * D );
}
vec2 LTC_Uv( const in vec3 N, const in vec3 V, const in float roughness ) {
	const float LUT_SIZE = 64.0;
	const float LUT_SCALE = ( LUT_SIZE - 1.0 ) / LUT_SIZE;
	const float LUT_BIAS = 0.5 / LUT_SIZE;
	float dotNV = saturate( dot( N, V ) );
	vec2 uv = vec2( roughness, sqrt( 1.0 - dotNV ) );
	uv = uv * LUT_SCALE + LUT_BIAS;
	return uv;
}
float LTC_ClippedSphereFormFactor( const in vec3 f ) {
	float l = length( f );
	return max( ( l * l + f.z ) / ( l + 1.0 ), 0.0 );
}
vec3 LTC_EdgeVectorFormFactor( const in vec3 v1, const in vec3 v2 ) {
	float x = dot( v1, v2 );
	float y = abs( x );
	float a = 0.8543985 + ( 0.4965155 + 0.0145206 * y ) * y;
	float b = 3.4175940 + ( 4.1616724 + y ) * y;
	float v = a / b;
	float theta_sintheta = ( x > 0.0 ) ? v : 0.5 * inversesqrt( max( 1.0 - x * x, 1e-7 ) ) - v;
	return cross( v1, v2 ) * theta_sintheta;
}
vec3 LTC_Evaluate( const in vec3 N, const in vec3 V, const in vec3 P, const in mat3 mInv, const in vec3 rectCoords[ 4 ] ) {
	vec3 v1 = rectCoords[ 1 ] - rectCoords[ 0 ];
	vec3 v2 = rectCoords[ 3 ] - rectCoords[ 0 ];
	vec3 lightNormal = cross( v1, v2 );
	if( dot( lightNormal, P - rectCoords[ 0 ] ) < 0.0 ) return vec3( 0.0 );
	vec3 T1, T2;
	T1 = normalize( V - N * dot( V, N ) );
	T2 = - cross( N, T1 );
	mat3 mat = mInv * transposeMat3( mat3( T1, T2, N ) );
	vec3 coords[ 4 ];
	coords[ 0 ] = mat * ( rectCoords[ 0 ] - P );
	coords[ 1 ] = mat * ( rectCoords[ 1 ] - P );
	coords[ 2 ] = mat * ( rectCoords[ 2 ] - P );
	coords[ 3 ] = mat * ( rectCoords[ 3 ] - P );
	coords[ 0 ] = normalize( coords[ 0 ] );
	coords[ 1 ] = normalize( coords[ 1 ] );
	coords[ 2 ] = normalize( coords[ 2 ] );
	coords[ 3 ] = normalize( coords[ 3 ] );
	vec3 vectorFormFactor = vec3( 0.0 );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 0 ], coords[ 1 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 1 ], coords[ 2 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 2 ], coords[ 3 ] );
	vectorFormFactor += LTC_EdgeVectorFormFactor( coords[ 3 ], coords[ 0 ] );
	float result = LTC_ClippedSphereFormFactor( vectorFormFactor );
	return vec3( result );
}
#if defined( USE_SHEEN )
float D_Charlie( float roughness, float dotNH ) {
	float alpha = pow2( roughness );
	float invAlpha = 1.0 / alpha;
	float cos2h = dotNH * dotNH;
	float sin2h = max( 1.0 - cos2h, 0.0078125 );
	return ( 2.0 + invAlpha ) * pow( sin2h, invAlpha * 0.5 ) / ( 2.0 * PI );
}
float V_Neubelt( float dotNV, float dotNL ) {
	return saturate( 1.0 / ( 4.0 * ( dotNL + dotNV - dotNL * dotNV ) ) );
}
vec3 BRDF_Sheen( const in vec3 lightDir, const in vec3 viewDir, const in vec3 normal, vec3 sheenColor, const in float sheenRoughness ) {
	vec3 halfDir = normalize( lightDir + viewDir );
	float dotNL = saturate( dot( normal, lightDir ) );
	float dotNV = saturate( dot( normal, viewDir ) );
	float dotNH = saturate( dot( normal, halfDir ) );
	float D = D_Charlie( sheenRoughness, dotNH );
	float V = V_Neubelt( dotNV, dotNL );
	return sheenColor * ( D * V );
}
#endif
float IBLSheenBRDF( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	float r2 = roughness * roughness;
	float a = roughness < 0.25 ? -339.2 * r2 + 161.4 * roughness - 25.9 : -8.48 * r2 + 14.3 * roughness - 9.95;
	float b = roughness < 0.25 ? 44.0 * r2 - 23.7 * roughness + 3.26 : 1.97 * r2 - 3.27 * roughness + 0.72;
	float DG = exp( a * dotNV + b ) + ( roughness < 0.25 ? 0.0 : 0.1 * ( roughness - 0.25 ) );
	return saturate( DG * RECIPROCAL_PI );
}
vec2 DFGApprox( const in vec3 normal, const in vec3 viewDir, const in float roughness ) {
	float dotNV = saturate( dot( normal, viewDir ) );
	const vec4 c0 = vec4( - 1, - 0.0275, - 0.572, 0.022 );
	const vec4 c1 = vec4( 1, 0.0425, 1.04, - 0.04 );
	vec4 r = roughness * c0 + c1;
	float a004 = min( r.x * r.x, exp2( - 9.28 * dotNV ) ) * r.x + r.y;
	vec2 fab = vec2( - 1.04, 1.04 ) * a004 + r.zw;
	return fab;
}
vec3 EnvironmentBRDF( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness ) {
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	return specularColor * fab.x + specularF90 * fab.y;
}
#ifdef USE_IRIDESCENCE
void computeMultiscatteringIridescence( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float iridescence, const in vec3 iridescenceF0, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#else
void computeMultiscattering( const in vec3 normal, const in vec3 viewDir, const in vec3 specularColor, const in float specularF90, const in float roughness, inout vec3 singleScatter, inout vec3 multiScatter ) {
#endif
	vec2 fab = DFGApprox( normal, viewDir, roughness );
	#ifdef USE_IRIDESCENCE
		vec3 Fr = mix( specularColor, iridescenceF0, iridescence );
	#else
		vec3 Fr = specularColor;
	#endif
	vec3 FssEss = Fr * fab.x + specularF90 * fab.y;
	float Ess = fab.x + fab.y;
	float Ems = 1.0 - Ess;
	vec3 Favg = Fr + ( 1.0 - Fr ) * 0.047619;	vec3 Fms = FssEss * Favg / ( 1.0 - Ems * Favg );
	singleScatter += FssEss;
	multiScatter += Fms * Ems;
}
#if NUM_RECT_AREA_LIGHTS > 0
	void RE_Direct_RectArea_Physical( const in RectAreaLight rectAreaLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
		vec3 normal = geometryNormal;
		vec3 viewDir = geometryViewDir;
		vec3 position = geometryPosition;
		vec3 lightPos = rectAreaLight.position;
		vec3 halfWidth = rectAreaLight.halfWidth;
		vec3 halfHeight = rectAreaLight.halfHeight;
		vec3 lightColor = rectAreaLight.color;
		float roughness = material.roughness;
		vec3 rectCoords[ 4 ];
		rectCoords[ 0 ] = lightPos + halfWidth - halfHeight;		rectCoords[ 1 ] = lightPos - halfWidth - halfHeight;
		rectCoords[ 2 ] = lightPos - halfWidth + halfHeight;
		rectCoords[ 3 ] = lightPos + halfWidth + halfHeight;
		vec2 uv = LTC_Uv( normal, viewDir, roughness );
		vec4 t1 = texture2D( ltc_1, uv );
		vec4 t2 = texture2D( ltc_2, uv );
		mat3 mInv = mat3(
			vec3( t1.x, 0, t1.y ),
			vec3(    0, 1,    0 ),
			vec3( t1.z, 0, t1.w )
		);
		vec3 fresnel = ( material.specularColor * t2.x + ( vec3( 1.0 ) - material.specularColor ) * t2.y );
		reflectedLight.directSpecular += lightColor * fresnel * LTC_Evaluate( normal, viewDir, position, mInv, rectCoords );
		reflectedLight.directDiffuse += lightColor * material.diffuseColor * LTC_Evaluate( normal, viewDir, position, mat3( 1.0 ), rectCoords );
	}
#endif
void RE_Direct_Physical( const in IncidentLight directLight, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	float dotNL = saturate( dot( geometryNormal, directLight.direction ) );
	vec3 irradiance = dotNL * directLight.color;
	#ifdef USE_CLEARCOAT
		float dotNLcc = saturate( dot( geometryClearcoatNormal, directLight.direction ) );
		vec3 ccIrradiance = dotNLcc * directLight.color;
		clearcoatSpecularDirect += ccIrradiance * BRDF_GGX_Clearcoat( directLight.direction, geometryViewDir, geometryClearcoatNormal, material );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularDirect += irradiance * BRDF_Sheen( directLight.direction, geometryViewDir, geometryNormal, material.sheenColor, material.sheenRoughness );
	#endif
	reflectedLight.directSpecular += irradiance * BRDF_GGX( directLight.direction, geometryViewDir, geometryNormal, material );
	reflectedLight.directDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectDiffuse_Physical( const in vec3 irradiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight ) {
	reflectedLight.indirectDiffuse += irradiance * BRDF_Lambert( material.diffuseColor );
}
void RE_IndirectSpecular_Physical( const in vec3 radiance, const in vec3 irradiance, const in vec3 clearcoatRadiance, const in vec3 geometryPosition, const in vec3 geometryNormal, const in vec3 geometryViewDir, const in vec3 geometryClearcoatNormal, const in PhysicalMaterial material, inout ReflectedLight reflectedLight) {
	#ifdef USE_CLEARCOAT
		clearcoatSpecularIndirect += clearcoatRadiance * EnvironmentBRDF( geometryClearcoatNormal, geometryViewDir, material.clearcoatF0, material.clearcoatF90, material.clearcoatRoughness );
	#endif
	#ifdef USE_SHEEN
		sheenSpecularIndirect += irradiance * material.sheenColor * IBLSheenBRDF( geometryNormal, geometryViewDir, material.sheenRoughness );
	#endif
	vec3 singleScattering = vec3( 0.0 );
	vec3 multiScattering = vec3( 0.0 );
	vec3 cosineWeightedIrradiance = irradiance * RECIPROCAL_PI;
	#ifdef USE_IRIDESCENCE
		computeMultiscatteringIridescence( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.iridescence, material.iridescenceFresnel, material.roughness, singleScattering, multiScattering );
	#else
		computeMultiscattering( geometryNormal, geometryViewDir, material.specularColor, material.specularF90, material.roughness, singleScattering, multiScattering );
	#endif
	vec3 totalScattering = singleScattering + multiScattering;
	vec3 diffuse = material.diffuseColor * ( 1.0 - max( max( totalScattering.r, totalScattering.g ), totalScattering.b ) );
	reflectedLight.indirectSpecular += radiance * singleScattering;
	reflectedLight.indirectSpecular += multiScattering * cosineWeightedIrradiance;
	reflectedLight.indirectDiffuse += diffuse * cosineWeightedIrradiance;
}
#define RE_Direct				RE_Direct_Physical
#define RE_Direct_RectArea		RE_Direct_RectArea_Physical
#define RE_IndirectDiffuse		RE_IndirectDiffuse_Physical
#define RE_IndirectSpecular		RE_IndirectSpecular_Physical
float computeSpecularOcclusion( const in float dotNV, const in float ambientOcclusion, const in float roughness ) {
	return saturate( pow( dotNV + ambientOcclusion, exp2( - 16.0 * roughness - 1.0 ) ) - 1.0 + ambientOcclusion );
}`,jp=`
vec3 geometryPosition = - vViewPosition;
vec3 geometryNormal = normal;
vec3 geometryViewDir = ( isOrthographic ) ? vec3( 0, 0, 1 ) : normalize( vViewPosition );
vec3 geometryClearcoatNormal = vec3( 0.0 );
#ifdef USE_CLEARCOAT
	geometryClearcoatNormal = clearcoatNormal;
#endif
#ifdef USE_IRIDESCENCE
	float dotNVi = saturate( dot( normal, geometryViewDir ) );
	if ( material.iridescenceThickness == 0.0 ) {
		material.iridescence = 0.0;
	} else {
		material.iridescence = saturate( material.iridescence );
	}
	if ( material.iridescence > 0.0 ) {
		material.iridescenceFresnel = evalIridescence( 1.0, material.iridescenceIOR, dotNVi, material.iridescenceThickness, material.specularColor );
		material.iridescenceF0 = Schlick_to_F0( material.iridescenceFresnel, 1.0, dotNVi );
	}
#endif
IncidentLight directLight;
#if ( NUM_POINT_LIGHTS > 0 ) && defined( RE_Direct )
	PointLight pointLight;
	#if defined( USE_SHADOWMAP ) && NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHTS; i ++ ) {
		pointLight = pointLights[ i ];
		getPointLightInfo( pointLight, geometryPosition, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_POINT_LIGHT_SHADOWS )
		pointLightShadow = pointLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getPointShadow( pointShadowMap[ i ], pointLightShadow.shadowMapSize, pointLightShadow.shadowIntensity, pointLightShadow.shadowBias, pointLightShadow.shadowRadius, vPointShadowCoord[ i ], pointLightShadow.shadowCameraNear, pointLightShadow.shadowCameraFar ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_SPOT_LIGHTS > 0 ) && defined( RE_Direct )
	SpotLight spotLight;
	vec4 spotColor;
	vec3 spotLightCoord;
	bool inSpotLightMap;
	#if defined( USE_SHADOWMAP ) && NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHTS; i ++ ) {
		spotLight = spotLights[ i ];
		getSpotLightInfo( spotLight, geometryPosition, directLight );
		#if ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#define SPOT_LIGHT_MAP_INDEX UNROLLED_LOOP_INDEX
		#elif ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		#define SPOT_LIGHT_MAP_INDEX NUM_SPOT_LIGHT_MAPS
		#else
		#define SPOT_LIGHT_MAP_INDEX ( UNROLLED_LOOP_INDEX - NUM_SPOT_LIGHT_SHADOWS + NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS )
		#endif
		#if ( SPOT_LIGHT_MAP_INDEX < NUM_SPOT_LIGHT_MAPS )
			spotLightCoord = vSpotLightCoord[ i ].xyz / vSpotLightCoord[ i ].w;
			inSpotLightMap = all( lessThan( abs( spotLightCoord * 2. - 1. ), vec3( 1.0 ) ) );
			spotColor = texture2D( spotLightMap[ SPOT_LIGHT_MAP_INDEX ], spotLightCoord.xy );
			directLight.color = inSpotLightMap ? directLight.color * spotColor.rgb : directLight.color;
		#endif
		#undef SPOT_LIGHT_MAP_INDEX
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
		spotLightShadow = spotLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( spotShadowMap[ i ], spotLightShadow.shadowMapSize, spotLightShadow.shadowIntensity, spotLightShadow.shadowBias, spotLightShadow.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_DIR_LIGHTS > 0 ) && defined( RE_Direct )
	DirectionalLight directionalLight;
	#if defined( USE_SHADOWMAP ) && NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLightShadow;
	#endif
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHTS; i ++ ) {
		directionalLight = directionalLights[ i ];
		getDirectionalLightInfo( directionalLight, directLight );
		#if defined( USE_SHADOWMAP ) && ( UNROLLED_LOOP_INDEX < NUM_DIR_LIGHT_SHADOWS )
		directionalLightShadow = directionalLightShadows[ i ];
		directLight.color *= ( directLight.visible && receiveShadow ) ? getShadow( directionalShadowMap[ i ], directionalLightShadow.shadowMapSize, directionalLightShadow.shadowIntensity, directionalLightShadow.shadowBias, directionalLightShadow.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
		#endif
		RE_Direct( directLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if ( NUM_RECT_AREA_LIGHTS > 0 ) && defined( RE_Direct_RectArea )
	RectAreaLight rectAreaLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_RECT_AREA_LIGHTS; i ++ ) {
		rectAreaLight = rectAreaLights[ i ];
		RE_Direct_RectArea( rectAreaLight, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
	}
	#pragma unroll_loop_end
#endif
#if defined( RE_IndirectDiffuse )
	vec3 iblIrradiance = vec3( 0.0 );
	vec3 irradiance = getAmbientLightIrradiance( ambientLightColor );
	#if defined( USE_LIGHT_PROBES )
		irradiance += getLightProbeIrradiance( lightProbe, geometryNormal );
	#endif
	#if ( NUM_HEMI_LIGHTS > 0 )
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_HEMI_LIGHTS; i ++ ) {
			irradiance += getHemisphereLightIrradiance( hemisphereLights[ i ], geometryNormal );
		}
		#pragma unroll_loop_end
	#endif
#endif
#if defined( RE_IndirectSpecular )
	vec3 radiance = vec3( 0.0 );
	vec3 clearcoatRadiance = vec3( 0.0 );
#endif`,Qp=`#if defined( RE_IndirectDiffuse )
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		vec3 lightMapIrradiance = lightMapTexel.rgb * lightMapIntensity;
		irradiance += lightMapIrradiance;
	#endif
	#if defined( USE_ENVMAP ) && defined( STANDARD ) && defined( ENVMAP_TYPE_CUBE_UV )
		iblIrradiance += getIBLIrradiance( geometryNormal );
	#endif
#endif
#if defined( USE_ENVMAP ) && defined( RE_IndirectSpecular )
	#ifdef USE_ANISOTROPY
		radiance += getIBLAnisotropyRadiance( geometryViewDir, geometryNormal, material.roughness, material.anisotropyB, material.anisotropy );
	#else
		radiance += getIBLRadiance( geometryViewDir, geometryNormal, material.roughness );
	#endif
	#ifdef USE_CLEARCOAT
		clearcoatRadiance += getIBLRadiance( geometryViewDir, geometryClearcoatNormal, material.clearcoatRoughness );
	#endif
#endif`,tf=`#if defined( RE_IndirectDiffuse )
	RE_IndirectDiffuse( irradiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif
#if defined( RE_IndirectSpecular )
	RE_IndirectSpecular( radiance, iblIrradiance, clearcoatRadiance, geometryPosition, geometryNormal, geometryViewDir, geometryClearcoatNormal, material, reflectedLight );
#endif`,ef=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	gl_FragDepth = vIsPerspective == 0.0 ? gl_FragCoord.z : log2( vFragDepth ) * logDepthBufFC * 0.5;
#endif`,nf=`#if defined( USE_LOGARITHMIC_DEPTH_BUFFER )
	uniform float logDepthBufFC;
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,sf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	varying float vFragDepth;
	varying float vIsPerspective;
#endif`,rf=`#ifdef USE_LOGARITHMIC_DEPTH_BUFFER
	vFragDepth = 1.0 + gl_Position.w;
	vIsPerspective = float( isPerspectiveMatrix( projectionMatrix ) );
#endif`,af=`#ifdef USE_MAP
	vec4 sampledDiffuseColor = texture2D( map, vMapUv );
	#ifdef DECODE_VIDEO_TEXTURE
		sampledDiffuseColor = sRGBTransferEOTF( sampledDiffuseColor );
	#endif
	diffuseColor *= sampledDiffuseColor;
#endif`,of=`#ifdef USE_MAP
	uniform sampler2D map;
#endif`,lf=`#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
	#if defined( USE_POINTS_UV )
		vec2 uv = vUv;
	#else
		vec2 uv = ( uvTransform * vec3( gl_PointCoord.x, 1.0 - gl_PointCoord.y, 1 ) ).xy;
	#endif
#endif
#ifdef USE_MAP
	diffuseColor *= texture2D( map, uv );
#endif
#ifdef USE_ALPHAMAP
	diffuseColor.a *= texture2D( alphaMap, uv ).g;
#endif`,cf=`#if defined( USE_POINTS_UV )
	varying vec2 vUv;
#else
	#if defined( USE_MAP ) || defined( USE_ALPHAMAP )
		uniform mat3 uvTransform;
	#endif
#endif
#ifdef USE_MAP
	uniform sampler2D map;
#endif
#ifdef USE_ALPHAMAP
	uniform sampler2D alphaMap;
#endif`,hf=`float metalnessFactor = metalness;
#ifdef USE_METALNESSMAP
	vec4 texelMetalness = texture2D( metalnessMap, vMetalnessMapUv );
	metalnessFactor *= texelMetalness.b;
#endif`,df=`#ifdef USE_METALNESSMAP
	uniform sampler2D metalnessMap;
#endif`,uf=`#ifdef USE_INSTANCING_MORPH
	float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	float morphTargetBaseInfluence = texelFetch( morphTexture, ivec2( 0, gl_InstanceID ), 0 ).r;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		morphTargetInfluences[i] =  texelFetch( morphTexture, ivec2( i + 1, gl_InstanceID ), 0 ).r;
	}
#endif`,pf=`#if defined( USE_MORPHCOLORS )
	vColor *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		#if defined( USE_COLOR_ALPHA )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ) * morphTargetInfluences[ i ];
		#elif defined( USE_COLOR )
			if ( morphTargetInfluences[ i ] != 0.0 ) vColor += getMorph( gl_VertexID, i, 2 ).rgb * morphTargetInfluences[ i ];
		#endif
	}
#endif`,ff=`#ifdef USE_MORPHNORMALS
	objectNormal *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) objectNormal += getMorph( gl_VertexID, i, 1 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,mf=`#ifdef USE_MORPHTARGETS
	#ifndef USE_INSTANCING_MORPH
		uniform float morphTargetBaseInfluence;
		uniform float morphTargetInfluences[ MORPHTARGETS_COUNT ];
	#endif
	uniform sampler2DArray morphTargetsTexture;
	uniform ivec2 morphTargetsTextureSize;
	vec4 getMorph( const in int vertexIndex, const in int morphTargetIndex, const in int offset ) {
		int texelIndex = vertexIndex * MORPHTARGETS_TEXTURE_STRIDE + offset;
		int y = texelIndex / morphTargetsTextureSize.x;
		int x = texelIndex - y * morphTargetsTextureSize.x;
		ivec3 morphUV = ivec3( x, y, morphTargetIndex );
		return texelFetch( morphTargetsTexture, morphUV, 0 );
	}
#endif`,gf=`#ifdef USE_MORPHTARGETS
	transformed *= morphTargetBaseInfluence;
	for ( int i = 0; i < MORPHTARGETS_COUNT; i ++ ) {
		if ( morphTargetInfluences[ i ] != 0.0 ) transformed += getMorph( gl_VertexID, i, 0 ).xyz * morphTargetInfluences[ i ];
	}
#endif`,_f=`float faceDirection = gl_FrontFacing ? 1.0 : - 1.0;
#ifdef FLAT_SHADED
	vec3 fdx = dFdx( vViewPosition );
	vec3 fdy = dFdy( vViewPosition );
	vec3 normal = normalize( cross( fdx, fdy ) );
#else
	vec3 normal = normalize( vNormal );
	#ifdef DOUBLE_SIDED
		normal *= faceDirection;
	#endif
#endif
#if defined( USE_NORMALMAP_TANGENTSPACE ) || defined( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY )
	#ifdef USE_TANGENT
		mat3 tbn = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn = getTangentFrame( - vViewPosition, normal,
		#if defined( USE_NORMALMAP )
			vNormalMapUv
		#elif defined( USE_CLEARCOAT_NORMALMAP )
			vClearcoatNormalMapUv
		#else
			vUv
		#endif
		);
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn[0] *= faceDirection;
		tbn[1] *= faceDirection;
	#endif
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	#ifdef USE_TANGENT
		mat3 tbn2 = mat3( normalize( vTangent ), normalize( vBitangent ), normal );
	#else
		mat3 tbn2 = getTangentFrame( - vViewPosition, normal, vClearcoatNormalMapUv );
	#endif
	#if defined( DOUBLE_SIDED ) && ! defined( FLAT_SHADED )
		tbn2[0] *= faceDirection;
		tbn2[1] *= faceDirection;
	#endif
#endif
vec3 nonPerturbedNormal = normal;`,xf=`#ifdef USE_NORMALMAP_OBJECTSPACE
	normal = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	#ifdef FLIP_SIDED
		normal = - normal;
	#endif
	#ifdef DOUBLE_SIDED
		normal = normal * faceDirection;
	#endif
	normal = normalize( normalMatrix * normal );
#elif defined( USE_NORMALMAP_TANGENTSPACE )
	vec3 mapN = texture2D( normalMap, vNormalMapUv ).xyz * 2.0 - 1.0;
	mapN.xy *= normalScale;
	normal = normalize( tbn * mapN );
#elif defined( USE_BUMPMAP )
	normal = perturbNormalArb( - vViewPosition, normal, dHdxy_fwd(), faceDirection );
#endif`,yf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,vf=`#ifndef FLAT_SHADED
	varying vec3 vNormal;
	#ifdef USE_TANGENT
		varying vec3 vTangent;
		varying vec3 vBitangent;
	#endif
#endif`,bf=`#ifndef FLAT_SHADED
	vNormal = normalize( transformedNormal );
	#ifdef USE_TANGENT
		vTangent = normalize( transformedTangent );
		vBitangent = normalize( cross( vNormal, vTangent ) * tangent.w );
	#endif
#endif`,Mf=`#ifdef USE_NORMALMAP
	uniform sampler2D normalMap;
	uniform vec2 normalScale;
#endif
#ifdef USE_NORMALMAP_OBJECTSPACE
	uniform mat3 normalMatrix;
#endif
#if ! defined ( USE_TANGENT ) && ( defined ( USE_NORMALMAP_TANGENTSPACE ) || defined ( USE_CLEARCOAT_NORMALMAP ) || defined( USE_ANISOTROPY ) )
	mat3 getTangentFrame( vec3 eye_pos, vec3 surf_norm, vec2 uv ) {
		vec3 q0 = dFdx( eye_pos.xyz );
		vec3 q1 = dFdy( eye_pos.xyz );
		vec2 st0 = dFdx( uv.st );
		vec2 st1 = dFdy( uv.st );
		vec3 N = surf_norm;
		vec3 q1perp = cross( q1, N );
		vec3 q0perp = cross( N, q0 );
		vec3 T = q1perp * st0.x + q0perp * st1.x;
		vec3 B = q1perp * st0.y + q0perp * st1.y;
		float det = max( dot( T, T ), dot( B, B ) );
		float scale = ( det == 0.0 ) ? 0.0 : inversesqrt( det );
		return mat3( T * scale, B * scale, N );
	}
#endif`,Sf=`#ifdef USE_CLEARCOAT
	vec3 clearcoatNormal = nonPerturbedNormal;
#endif`,wf=`#ifdef USE_CLEARCOAT_NORMALMAP
	vec3 clearcoatMapN = texture2D( clearcoatNormalMap, vClearcoatNormalMapUv ).xyz * 2.0 - 1.0;
	clearcoatMapN.xy *= clearcoatNormalScale;
	clearcoatNormal = normalize( tbn2 * clearcoatMapN );
#endif`,Ef=`#ifdef USE_CLEARCOATMAP
	uniform sampler2D clearcoatMap;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform sampler2D clearcoatNormalMap;
	uniform vec2 clearcoatNormalScale;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform sampler2D clearcoatRoughnessMap;
#endif`,Tf=`#ifdef USE_IRIDESCENCEMAP
	uniform sampler2D iridescenceMap;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform sampler2D iridescenceThicknessMap;
#endif`,Af=`#ifdef OPAQUE
diffuseColor.a = 1.0;
#endif
#ifdef USE_TRANSMISSION
diffuseColor.a *= material.transmissionAlpha;
#endif
gl_FragColor = vec4( outgoingLight, diffuseColor.a );`,Cf=`vec3 packNormalToRGB( const in vec3 normal ) {
	return normalize( normal ) * 0.5 + 0.5;
}
vec3 unpackRGBToNormal( const in vec3 rgb ) {
	return 2.0 * rgb.xyz - 1.0;
}
const float PackUpscale = 256. / 255.;const float UnpackDownscale = 255. / 256.;const float ShiftRight8 = 1. / 256.;
const float Inv255 = 1. / 255.;
const vec4 PackFactors = vec4( 1.0, 256.0, 256.0 * 256.0, 256.0 * 256.0 * 256.0 );
const vec2 UnpackFactors2 = vec2( UnpackDownscale, 1.0 / PackFactors.g );
const vec3 UnpackFactors3 = vec3( UnpackDownscale / PackFactors.rg, 1.0 / PackFactors.b );
const vec4 UnpackFactors4 = vec4( UnpackDownscale / PackFactors.rgb, 1.0 / PackFactors.a );
vec4 packDepthToRGBA( const in float v ) {
	if( v <= 0.0 )
		return vec4( 0., 0., 0., 0. );
	if( v >= 1.0 )
		return vec4( 1., 1., 1., 1. );
	float vuf;
	float af = modf( v * PackFactors.a, vuf );
	float bf = modf( vuf * ShiftRight8, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec4( vuf * Inv255, gf * PackUpscale, bf * PackUpscale, af );
}
vec3 packDepthToRGB( const in float v ) {
	if( v <= 0.0 )
		return vec3( 0., 0., 0. );
	if( v >= 1.0 )
		return vec3( 1., 1., 1. );
	float vuf;
	float bf = modf( v * PackFactors.b, vuf );
	float gf = modf( vuf * ShiftRight8, vuf );
	return vec3( vuf * Inv255, gf * PackUpscale, bf );
}
vec2 packDepthToRG( const in float v ) {
	if( v <= 0.0 )
		return vec2( 0., 0. );
	if( v >= 1.0 )
		return vec2( 1., 1. );
	float vuf;
	float gf = modf( v * 256., vuf );
	return vec2( vuf * Inv255, gf );
}
float unpackRGBAToDepth( const in vec4 v ) {
	return dot( v, UnpackFactors4 );
}
float unpackRGBToDepth( const in vec3 v ) {
	return dot( v, UnpackFactors3 );
}
float unpackRGToDepth( const in vec2 v ) {
	return v.r * UnpackFactors2.r + v.g * UnpackFactors2.g;
}
vec4 pack2HalfToRGBA( const in vec2 v ) {
	vec4 r = vec4( v.x, fract( v.x * 255.0 ), v.y, fract( v.y * 255.0 ) );
	return vec4( r.x - r.y / 255.0, r.y, r.z - r.w / 255.0, r.w );
}
vec2 unpackRGBATo2Half( const in vec4 v ) {
	return vec2( v.x + ( v.y / 255.0 ), v.z + ( v.w / 255.0 ) );
}
float viewZToOrthographicDepth( const in float viewZ, const in float near, const in float far ) {
	return ( viewZ + near ) / ( near - far );
}
float orthographicDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return depth * ( near - far ) - near;
}
float viewZToPerspectiveDepth( const in float viewZ, const in float near, const in float far ) {
	return ( ( near + viewZ ) * far ) / ( ( far - near ) * viewZ );
}
float perspectiveDepthToViewZ( const in float depth, const in float near, const in float far ) {
	return ( near * far ) / ( ( far - near ) * depth - far );
}`,Rf=`#ifdef PREMULTIPLIED_ALPHA
	gl_FragColor.rgb *= gl_FragColor.a;
#endif`,Pf=`vec4 mvPosition = vec4( transformed, 1.0 );
#ifdef USE_BATCHING
	mvPosition = batchingMatrix * mvPosition;
#endif
#ifdef USE_INSTANCING
	mvPosition = instanceMatrix * mvPosition;
#endif
mvPosition = modelViewMatrix * mvPosition;
gl_Position = projectionMatrix * mvPosition;`,If=`#ifdef DITHERING
	gl_FragColor.rgb = dithering( gl_FragColor.rgb );
#endif`,Lf=`#ifdef DITHERING
	vec3 dithering( vec3 color ) {
		float grid_position = rand( gl_FragCoord.xy );
		vec3 dither_shift_RGB = vec3( 0.25 / 255.0, -0.25 / 255.0, 0.25 / 255.0 );
		dither_shift_RGB = mix( 2.0 * dither_shift_RGB, -2.0 * dither_shift_RGB, grid_position );
		return color + dither_shift_RGB;
	}
#endif`,Df=`float roughnessFactor = roughness;
#ifdef USE_ROUGHNESSMAP
	vec4 texelRoughness = texture2D( roughnessMap, vRoughnessMapUv );
	roughnessFactor *= texelRoughness.g;
#endif`,Nf=`#ifdef USE_ROUGHNESSMAP
	uniform sampler2D roughnessMap;
#endif`,Uf=`#if NUM_SPOT_LIGHT_COORDS > 0
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#if NUM_SPOT_LIGHT_MAPS > 0
	uniform sampler2D spotLightMap[ NUM_SPOT_LIGHT_MAPS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform sampler2D directionalShadowMap[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		uniform sampler2D spotShadowMap[ NUM_SPOT_LIGHT_SHADOWS ];
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform sampler2D pointShadowMap[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
	float texture2DCompare( sampler2D depths, vec2 uv, float compare ) {
		float depth = unpackRGBAToDepth( texture2D( depths, uv ) );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			return step( depth, compare );
		#else
			return step( compare, depth );
		#endif
	}
	vec2 texture2DDistribution( sampler2D shadow, vec2 uv ) {
		return unpackRGBATo2Half( texture2D( shadow, uv ) );
	}
	float VSMShadow( sampler2D shadow, vec2 uv, float compare ) {
		float occlusion = 1.0;
		vec2 distribution = texture2DDistribution( shadow, uv );
		#ifdef USE_REVERSED_DEPTH_BUFFER
			float hard_shadow = step( distribution.x, compare );
		#else
			float hard_shadow = step( compare, distribution.x );
		#endif
		if ( hard_shadow != 1.0 ) {
			float distance = compare - distribution.x;
			float variance = max( 0.00000, distribution.y * distribution.y );
			float softness_probability = variance / (variance + distance * distance );			softness_probability = clamp( ( softness_probability - 0.3 ) / ( 0.95 - 0.3 ), 0.0, 1.0 );			occlusion = clamp( max( hard_shadow, softness_probability ), 0.0, 1.0 );
		}
		return occlusion;
	}
	float getShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord ) {
		float shadow = 1.0;
		shadowCoord.xyz /= shadowCoord.w;
		shadowCoord.z += shadowBias;
		bool inFrustum = shadowCoord.x >= 0.0 && shadowCoord.x <= 1.0 && shadowCoord.y >= 0.0 && shadowCoord.y <= 1.0;
		bool frustumTest = inFrustum && shadowCoord.z <= 1.0;
		if ( frustumTest ) {
		#if defined( SHADOWMAP_TYPE_PCF )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx0 = - texelSize.x * shadowRadius;
			float dy0 = - texelSize.y * shadowRadius;
			float dx1 = + texelSize.x * shadowRadius;
			float dy1 = + texelSize.y * shadowRadius;
			float dx2 = dx0 / 2.0;
			float dy2 = dy0 / 2.0;
			float dx3 = dx1 / 2.0;
			float dy3 = dy1 / 2.0;
			shadow = (
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy2 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx2, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx3, dy3 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( 0.0, dy1 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, shadowCoord.xy + vec2( dx1, dy1 ), shadowCoord.z )
			) * ( 1.0 / 17.0 );
		#elif defined( SHADOWMAP_TYPE_PCF_SOFT )
			vec2 texelSize = vec2( 1.0 ) / shadowMapSize;
			float dx = texelSize.x;
			float dy = texelSize.y;
			vec2 uv = shadowCoord.xy;
			vec2 f = fract( uv * shadowMapSize + 0.5 );
			uv -= f * texelSize;
			shadow = (
				texture2DCompare( shadowMap, uv, shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( dx, 0.0 ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + vec2( 0.0, dy ), shadowCoord.z ) +
				texture2DCompare( shadowMap, uv + texelSize, shadowCoord.z ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, 0.0 ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 0.0 ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( -dx, dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, dy ), shadowCoord.z ),
					 f.x ) +
				mix( texture2DCompare( shadowMap, uv + vec2( 0.0, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( 0.0, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( texture2DCompare( shadowMap, uv + vec2( dx, -dy ), shadowCoord.z ),
					 texture2DCompare( shadowMap, uv + vec2( dx, 2.0 * dy ), shadowCoord.z ),
					 f.y ) +
				mix( mix( texture2DCompare( shadowMap, uv + vec2( -dx, -dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, -dy ), shadowCoord.z ),
						  f.x ),
					 mix( texture2DCompare( shadowMap, uv + vec2( -dx, 2.0 * dy ), shadowCoord.z ),
						  texture2DCompare( shadowMap, uv + vec2( 2.0 * dx, 2.0 * dy ), shadowCoord.z ),
						  f.x ),
					 f.y )
			) * ( 1.0 / 9.0 );
		#elif defined( SHADOWMAP_TYPE_VSM )
			shadow = VSMShadow( shadowMap, shadowCoord.xy, shadowCoord.z );
		#else
			shadow = texture2DCompare( shadowMap, shadowCoord.xy, shadowCoord.z );
		#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
	vec2 cubeToUV( vec3 v, float texelSizeY ) {
		vec3 absV = abs( v );
		float scaleToCube = 1.0 / max( absV.x, max( absV.y, absV.z ) );
		absV *= scaleToCube;
		v *= scaleToCube * ( 1.0 - 2.0 * texelSizeY );
		vec2 planar = v.xy;
		float almostATexel = 1.5 * texelSizeY;
		float almostOne = 1.0 - almostATexel;
		if ( absV.z >= almostOne ) {
			if ( v.z > 0.0 )
				planar.x = 4.0 - v.x;
		} else if ( absV.x >= almostOne ) {
			float signX = sign( v.x );
			planar.x = v.z * signX + 2.0 * signX;
		} else if ( absV.y >= almostOne ) {
			float signY = sign( v.y );
			planar.x = v.x + 2.0 * signY + 2.0;
			planar.y = v.z * signY - 2.0;
		}
		return vec2( 0.125, 0.25 ) * planar + vec2( 0.375, 0.75 );
	}
	float getPointShadow( sampler2D shadowMap, vec2 shadowMapSize, float shadowIntensity, float shadowBias, float shadowRadius, vec4 shadowCoord, float shadowCameraNear, float shadowCameraFar ) {
		float shadow = 1.0;
		vec3 lightToPosition = shadowCoord.xyz;
		
		float lightToPositionLength = length( lightToPosition );
		if ( lightToPositionLength - shadowCameraFar <= 0.0 && lightToPositionLength - shadowCameraNear >= 0.0 ) {
			float dp = ( lightToPositionLength - shadowCameraNear ) / ( shadowCameraFar - shadowCameraNear );			dp += shadowBias;
			vec3 bd3D = normalize( lightToPosition );
			vec2 texelSize = vec2( 1.0 ) / ( shadowMapSize * vec2( 4.0, 2.0 ) );
			#if defined( SHADOWMAP_TYPE_PCF ) || defined( SHADOWMAP_TYPE_PCF_SOFT ) || defined( SHADOWMAP_TYPE_VSM )
				vec2 offset = vec2( - 1, 1 ) * shadowRadius * texelSize.y;
				shadow = (
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yyx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxy, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.xxx, texelSize.y ), dp ) +
					texture2DCompare( shadowMap, cubeToUV( bd3D + offset.yxx, texelSize.y ), dp )
				) * ( 1.0 / 9.0 );
			#else
				shadow = texture2DCompare( shadowMap, cubeToUV( bd3D, texelSize.y ), dp );
			#endif
		}
		return mix( 1.0, shadow, shadowIntensity );
	}
#endif`,Ff=`#if NUM_SPOT_LIGHT_COORDS > 0
	uniform mat4 spotLightMatrix[ NUM_SPOT_LIGHT_COORDS ];
	varying vec4 vSpotLightCoord[ NUM_SPOT_LIGHT_COORDS ];
#endif
#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
		uniform mat4 directionalShadowMatrix[ NUM_DIR_LIGHT_SHADOWS ];
		varying vec4 vDirectionalShadowCoord[ NUM_DIR_LIGHT_SHADOWS ];
		struct DirectionalLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform DirectionalLightShadow directionalLightShadows[ NUM_DIR_LIGHT_SHADOWS ];
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
		struct SpotLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
		};
		uniform SpotLightShadow spotLightShadows[ NUM_SPOT_LIGHT_SHADOWS ];
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		uniform mat4 pointShadowMatrix[ NUM_POINT_LIGHT_SHADOWS ];
		varying vec4 vPointShadowCoord[ NUM_POINT_LIGHT_SHADOWS ];
		struct PointLightShadow {
			float shadowIntensity;
			float shadowBias;
			float shadowNormalBias;
			float shadowRadius;
			vec2 shadowMapSize;
			float shadowCameraNear;
			float shadowCameraFar;
		};
		uniform PointLightShadow pointLightShadows[ NUM_POINT_LIGHT_SHADOWS ];
	#endif
#endif`,Of=`#if ( defined( USE_SHADOWMAP ) && ( NUM_DIR_LIGHT_SHADOWS > 0 || NUM_POINT_LIGHT_SHADOWS > 0 ) ) || ( NUM_SPOT_LIGHT_COORDS > 0 )
	vec3 shadowWorldNormal = inverseTransformDirection( transformedNormal, viewMatrix );
	vec4 shadowWorldPosition;
#endif
#if defined( USE_SHADOWMAP )
	#if NUM_DIR_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * directionalLightShadows[ i ].shadowNormalBias, 0 );
			vDirectionalShadowCoord[ i ] = directionalShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
		#pragma unroll_loop_start
		for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
			shadowWorldPosition = worldPosition + vec4( shadowWorldNormal * pointLightShadows[ i ].shadowNormalBias, 0 );
			vPointShadowCoord[ i ] = pointShadowMatrix[ i ] * shadowWorldPosition;
		}
		#pragma unroll_loop_end
	#endif
#endif
#if NUM_SPOT_LIGHT_COORDS > 0
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_COORDS; i ++ ) {
		shadowWorldPosition = worldPosition;
		#if ( defined( USE_SHADOWMAP ) && UNROLLED_LOOP_INDEX < NUM_SPOT_LIGHT_SHADOWS )
			shadowWorldPosition.xyz += shadowWorldNormal * spotLightShadows[ i ].shadowNormalBias;
		#endif
		vSpotLightCoord[ i ] = spotLightMatrix[ i ] * shadowWorldPosition;
	}
	#pragma unroll_loop_end
#endif`,Bf=`float getShadowMask() {
	float shadow = 1.0;
	#ifdef USE_SHADOWMAP
	#if NUM_DIR_LIGHT_SHADOWS > 0
	DirectionalLightShadow directionalLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_DIR_LIGHT_SHADOWS; i ++ ) {
		directionalLight = directionalLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( directionalShadowMap[ i ], directionalLight.shadowMapSize, directionalLight.shadowIntensity, directionalLight.shadowBias, directionalLight.shadowRadius, vDirectionalShadowCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_SPOT_LIGHT_SHADOWS > 0
	SpotLightShadow spotLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_SPOT_LIGHT_SHADOWS; i ++ ) {
		spotLight = spotLightShadows[ i ];
		shadow *= receiveShadow ? getShadow( spotShadowMap[ i ], spotLight.shadowMapSize, spotLight.shadowIntensity, spotLight.shadowBias, spotLight.shadowRadius, vSpotLightCoord[ i ] ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#if NUM_POINT_LIGHT_SHADOWS > 0
	PointLightShadow pointLight;
	#pragma unroll_loop_start
	for ( int i = 0; i < NUM_POINT_LIGHT_SHADOWS; i ++ ) {
		pointLight = pointLightShadows[ i ];
		shadow *= receiveShadow ? getPointShadow( pointShadowMap[ i ], pointLight.shadowMapSize, pointLight.shadowIntensity, pointLight.shadowBias, pointLight.shadowRadius, vPointShadowCoord[ i ], pointLight.shadowCameraNear, pointLight.shadowCameraFar ) : 1.0;
	}
	#pragma unroll_loop_end
	#endif
	#endif
	return shadow;
}`,zf=`#ifdef USE_SKINNING
	mat4 boneMatX = getBoneMatrix( skinIndex.x );
	mat4 boneMatY = getBoneMatrix( skinIndex.y );
	mat4 boneMatZ = getBoneMatrix( skinIndex.z );
	mat4 boneMatW = getBoneMatrix( skinIndex.w );
#endif`,kf=`#ifdef USE_SKINNING
	uniform mat4 bindMatrix;
	uniform mat4 bindMatrixInverse;
	uniform highp sampler2D boneTexture;
	mat4 getBoneMatrix( const in float i ) {
		int size = textureSize( boneTexture, 0 ).x;
		int j = int( i ) * 4;
		int x = j % size;
		int y = j / size;
		vec4 v1 = texelFetch( boneTexture, ivec2( x, y ), 0 );
		vec4 v2 = texelFetch( boneTexture, ivec2( x + 1, y ), 0 );
		vec4 v3 = texelFetch( boneTexture, ivec2( x + 2, y ), 0 );
		vec4 v4 = texelFetch( boneTexture, ivec2( x + 3, y ), 0 );
		return mat4( v1, v2, v3, v4 );
	}
#endif`,Vf=`#ifdef USE_SKINNING
	vec4 skinVertex = bindMatrix * vec4( transformed, 1.0 );
	vec4 skinned = vec4( 0.0 );
	skinned += boneMatX * skinVertex * skinWeight.x;
	skinned += boneMatY * skinVertex * skinWeight.y;
	skinned += boneMatZ * skinVertex * skinWeight.z;
	skinned += boneMatW * skinVertex * skinWeight.w;
	transformed = ( bindMatrixInverse * skinned ).xyz;
#endif`,Hf=`#ifdef USE_SKINNING
	mat4 skinMatrix = mat4( 0.0 );
	skinMatrix += skinWeight.x * boneMatX;
	skinMatrix += skinWeight.y * boneMatY;
	skinMatrix += skinWeight.z * boneMatZ;
	skinMatrix += skinWeight.w * boneMatW;
	skinMatrix = bindMatrixInverse * skinMatrix * bindMatrix;
	objectNormal = vec4( skinMatrix * vec4( objectNormal, 0.0 ) ).xyz;
	#ifdef USE_TANGENT
		objectTangent = vec4( skinMatrix * vec4( objectTangent, 0.0 ) ).xyz;
	#endif
#endif`,Gf=`float specularStrength;
#ifdef USE_SPECULARMAP
	vec4 texelSpecular = texture2D( specularMap, vSpecularMapUv );
	specularStrength = texelSpecular.r;
#else
	specularStrength = 1.0;
#endif`,Wf=`#ifdef USE_SPECULARMAP
	uniform sampler2D specularMap;
#endif`,Xf=`#if defined( TONE_MAPPING )
	gl_FragColor.rgb = toneMapping( gl_FragColor.rgb );
#endif`,$f=`#ifndef saturate
#define saturate( a ) clamp( a, 0.0, 1.0 )
#endif
uniform float toneMappingExposure;
vec3 LinearToneMapping( vec3 color ) {
	return saturate( toneMappingExposure * color );
}
vec3 ReinhardToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	return saturate( color / ( vec3( 1.0 ) + color ) );
}
vec3 CineonToneMapping( vec3 color ) {
	color *= toneMappingExposure;
	color = max( vec3( 0.0 ), color - 0.004 );
	return pow( ( color * ( 6.2 * color + 0.5 ) ) / ( color * ( 6.2 * color + 1.7 ) + 0.06 ), vec3( 2.2 ) );
}
vec3 RRTAndODTFit( vec3 v ) {
	vec3 a = v * ( v + 0.0245786 ) - 0.000090537;
	vec3 b = v * ( 0.983729 * v + 0.4329510 ) + 0.238081;
	return a / b;
}
vec3 ACESFilmicToneMapping( vec3 color ) {
	const mat3 ACESInputMat = mat3(
		vec3( 0.59719, 0.07600, 0.02840 ),		vec3( 0.35458, 0.90834, 0.13383 ),
		vec3( 0.04823, 0.01566, 0.83777 )
	);
	const mat3 ACESOutputMat = mat3(
		vec3(  1.60475, -0.10208, -0.00327 ),		vec3( -0.53108,  1.10813, -0.07276 ),
		vec3( -0.07367, -0.00605,  1.07602 )
	);
	color *= toneMappingExposure / 0.6;
	color = ACESInputMat * color;
	color = RRTAndODTFit( color );
	color = ACESOutputMat * color;
	return saturate( color );
}
const mat3 LINEAR_REC2020_TO_LINEAR_SRGB = mat3(
	vec3( 1.6605, - 0.1246, - 0.0182 ),
	vec3( - 0.5876, 1.1329, - 0.1006 ),
	vec3( - 0.0728, - 0.0083, 1.1187 )
);
const mat3 LINEAR_SRGB_TO_LINEAR_REC2020 = mat3(
	vec3( 0.6274, 0.0691, 0.0164 ),
	vec3( 0.3293, 0.9195, 0.0880 ),
	vec3( 0.0433, 0.0113, 0.8956 )
);
vec3 agxDefaultContrastApprox( vec3 x ) {
	vec3 x2 = x * x;
	vec3 x4 = x2 * x2;
	return + 15.5 * x4 * x2
		- 40.14 * x4 * x
		+ 31.96 * x4
		- 6.868 * x2 * x
		+ 0.4298 * x2
		+ 0.1191 * x
		- 0.00232;
}
vec3 AgXToneMapping( vec3 color ) {
	const mat3 AgXInsetMatrix = mat3(
		vec3( 0.856627153315983, 0.137318972929847, 0.11189821299995 ),
		vec3( 0.0951212405381588, 0.761241990602591, 0.0767994186031903 ),
		vec3( 0.0482516061458583, 0.101439036467562, 0.811302368396859 )
	);
	const mat3 AgXOutsetMatrix = mat3(
		vec3( 1.1271005818144368, - 0.1413297634984383, - 0.14132976349843826 ),
		vec3( - 0.11060664309660323, 1.157823702216272, - 0.11060664309660294 ),
		vec3( - 0.016493938717834573, - 0.016493938717834257, 1.2519364065950405 )
	);
	const float AgxMinEv = - 12.47393;	const float AgxMaxEv = 4.026069;
	color *= toneMappingExposure;
	color = LINEAR_SRGB_TO_LINEAR_REC2020 * color;
	color = AgXInsetMatrix * color;
	color = max( color, 1e-10 );	color = log2( color );
	color = ( color - AgxMinEv ) / ( AgxMaxEv - AgxMinEv );
	color = clamp( color, 0.0, 1.0 );
	color = agxDefaultContrastApprox( color );
	color = AgXOutsetMatrix * color;
	color = pow( max( vec3( 0.0 ), color ), vec3( 2.2 ) );
	color = LINEAR_REC2020_TO_LINEAR_SRGB * color;
	color = clamp( color, 0.0, 1.0 );
	return color;
}
vec3 NeutralToneMapping( vec3 color ) {
	const float StartCompression = 0.8 - 0.04;
	const float Desaturation = 0.15;
	color *= toneMappingExposure;
	float x = min( color.r, min( color.g, color.b ) );
	float offset = x < 0.08 ? x - 6.25 * x * x : 0.04;
	color -= offset;
	float peak = max( color.r, max( color.g, color.b ) );
	if ( peak < StartCompression ) return color;
	float d = 1. - StartCompression;
	float newPeak = 1. - d * d / ( peak + d - StartCompression );
	color *= newPeak / peak;
	float g = 1. - 1. / ( Desaturation * ( peak - newPeak ) + 1. );
	return mix( color, vec3( newPeak ), g );
}
vec3 CustomToneMapping( vec3 color ) { return color; }`,qf=`#ifdef USE_TRANSMISSION
	material.transmission = transmission;
	material.transmissionAlpha = 1.0;
	material.thickness = thickness;
	material.attenuationDistance = attenuationDistance;
	material.attenuationColor = attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		material.transmission *= texture2D( transmissionMap, vTransmissionMapUv ).r;
	#endif
	#ifdef USE_THICKNESSMAP
		material.thickness *= texture2D( thicknessMap, vThicknessMapUv ).g;
	#endif
	vec3 pos = vWorldPosition;
	vec3 v = normalize( cameraPosition - pos );
	vec3 n = inverseTransformDirection( normal, viewMatrix );
	vec4 transmitted = getIBLVolumeRefraction(
		n, v, material.roughness, material.diffuseColor, material.specularColor, material.specularF90,
		pos, modelMatrix, viewMatrix, projectionMatrix, material.dispersion, material.ior, material.thickness,
		material.attenuationColor, material.attenuationDistance );
	material.transmissionAlpha = mix( material.transmissionAlpha, transmitted.a, material.transmission );
	totalDiffuse = mix( totalDiffuse, transmitted.rgb, material.transmission );
#endif`,Yf=`#ifdef USE_TRANSMISSION
	uniform float transmission;
	uniform float thickness;
	uniform float attenuationDistance;
	uniform vec3 attenuationColor;
	#ifdef USE_TRANSMISSIONMAP
		uniform sampler2D transmissionMap;
	#endif
	#ifdef USE_THICKNESSMAP
		uniform sampler2D thicknessMap;
	#endif
	uniform vec2 transmissionSamplerSize;
	uniform sampler2D transmissionSamplerMap;
	uniform mat4 modelMatrix;
	uniform mat4 projectionMatrix;
	varying vec3 vWorldPosition;
	float w0( float a ) {
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - a + 3.0 ) - 3.0 ) + 1.0 );
	}
	float w1( float a ) {
		return ( 1.0 / 6.0 ) * ( a *  a * ( 3.0 * a - 6.0 ) + 4.0 );
	}
	float w2( float a ){
		return ( 1.0 / 6.0 ) * ( a * ( a * ( - 3.0 * a + 3.0 ) + 3.0 ) + 1.0 );
	}
	float w3( float a ) {
		return ( 1.0 / 6.0 ) * ( a * a * a );
	}
	float g0( float a ) {
		return w0( a ) + w1( a );
	}
	float g1( float a ) {
		return w2( a ) + w3( a );
	}
	float h0( float a ) {
		return - 1.0 + w1( a ) / ( w0( a ) + w1( a ) );
	}
	float h1( float a ) {
		return 1.0 + w3( a ) / ( w2( a ) + w3( a ) );
	}
	vec4 bicubic( sampler2D tex, vec2 uv, vec4 texelSize, float lod ) {
		uv = uv * texelSize.zw + 0.5;
		vec2 iuv = floor( uv );
		vec2 fuv = fract( uv );
		float g0x = g0( fuv.x );
		float g1x = g1( fuv.x );
		float h0x = h0( fuv.x );
		float h1x = h1( fuv.x );
		float h0y = h0( fuv.y );
		float h1y = h1( fuv.y );
		vec2 p0 = ( vec2( iuv.x + h0x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p1 = ( vec2( iuv.x + h1x, iuv.y + h0y ) - 0.5 ) * texelSize.xy;
		vec2 p2 = ( vec2( iuv.x + h0x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		vec2 p3 = ( vec2( iuv.x + h1x, iuv.y + h1y ) - 0.5 ) * texelSize.xy;
		return g0( fuv.y ) * ( g0x * textureLod( tex, p0, lod ) + g1x * textureLod( tex, p1, lod ) ) +
			g1( fuv.y ) * ( g0x * textureLod( tex, p2, lod ) + g1x * textureLod( tex, p3, lod ) );
	}
	vec4 textureBicubic( sampler2D sampler, vec2 uv, float lod ) {
		vec2 fLodSize = vec2( textureSize( sampler, int( lod ) ) );
		vec2 cLodSize = vec2( textureSize( sampler, int( lod + 1.0 ) ) );
		vec2 fLodSizeInv = 1.0 / fLodSize;
		vec2 cLodSizeInv = 1.0 / cLodSize;
		vec4 fSample = bicubic( sampler, uv, vec4( fLodSizeInv, fLodSize ), floor( lod ) );
		vec4 cSample = bicubic( sampler, uv, vec4( cLodSizeInv, cLodSize ), ceil( lod ) );
		return mix( fSample, cSample, fract( lod ) );
	}
	vec3 getVolumeTransmissionRay( const in vec3 n, const in vec3 v, const in float thickness, const in float ior, const in mat4 modelMatrix ) {
		vec3 refractionVector = refract( - v, normalize( n ), 1.0 / ior );
		vec3 modelScale;
		modelScale.x = length( vec3( modelMatrix[ 0 ].xyz ) );
		modelScale.y = length( vec3( modelMatrix[ 1 ].xyz ) );
		modelScale.z = length( vec3( modelMatrix[ 2 ].xyz ) );
		return normalize( refractionVector ) * thickness * modelScale;
	}
	float applyIorToRoughness( const in float roughness, const in float ior ) {
		return roughness * clamp( ior * 2.0 - 2.0, 0.0, 1.0 );
	}
	vec4 getTransmissionSample( const in vec2 fragCoord, const in float roughness, const in float ior ) {
		float lod = log2( transmissionSamplerSize.x ) * applyIorToRoughness( roughness, ior );
		return textureBicubic( transmissionSamplerMap, fragCoord.xy, lod );
	}
	vec3 volumeAttenuation( const in float transmissionDistance, const in vec3 attenuationColor, const in float attenuationDistance ) {
		if ( isinf( attenuationDistance ) ) {
			return vec3( 1.0 );
		} else {
			vec3 attenuationCoefficient = -log( attenuationColor ) / attenuationDistance;
			vec3 transmittance = exp( - attenuationCoefficient * transmissionDistance );			return transmittance;
		}
	}
	vec4 getIBLVolumeRefraction( const in vec3 n, const in vec3 v, const in float roughness, const in vec3 diffuseColor,
		const in vec3 specularColor, const in float specularF90, const in vec3 position, const in mat4 modelMatrix,
		const in mat4 viewMatrix, const in mat4 projMatrix, const in float dispersion, const in float ior, const in float thickness,
		const in vec3 attenuationColor, const in float attenuationDistance ) {
		vec4 transmittedLight;
		vec3 transmittance;
		#ifdef USE_DISPERSION
			float halfSpread = ( ior - 1.0 ) * 0.025 * dispersion;
			vec3 iors = vec3( ior - halfSpread, ior, ior + halfSpread );
			for ( int i = 0; i < 3; i ++ ) {
				vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, iors[ i ], modelMatrix );
				vec3 refractedRayExit = position + transmissionRay;
				vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
				vec2 refractionCoords = ndcPos.xy / ndcPos.w;
				refractionCoords += 1.0;
				refractionCoords /= 2.0;
				vec4 transmissionSample = getTransmissionSample( refractionCoords, roughness, iors[ i ] );
				transmittedLight[ i ] = transmissionSample[ i ];
				transmittedLight.a += transmissionSample.a;
				transmittance[ i ] = diffuseColor[ i ] * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance )[ i ];
			}
			transmittedLight.a /= 3.0;
		#else
			vec3 transmissionRay = getVolumeTransmissionRay( n, v, thickness, ior, modelMatrix );
			vec3 refractedRayExit = position + transmissionRay;
			vec4 ndcPos = projMatrix * viewMatrix * vec4( refractedRayExit, 1.0 );
			vec2 refractionCoords = ndcPos.xy / ndcPos.w;
			refractionCoords += 1.0;
			refractionCoords /= 2.0;
			transmittedLight = getTransmissionSample( refractionCoords, roughness, ior );
			transmittance = diffuseColor * volumeAttenuation( length( transmissionRay ), attenuationColor, attenuationDistance );
		#endif
		vec3 attenuatedColor = transmittance * transmittedLight.rgb;
		vec3 F = EnvironmentBRDF( n, v, specularColor, specularF90, roughness );
		float transmittanceFactor = ( transmittance.r + transmittance.g + transmittance.b ) / 3.0;
		return vec4( ( 1.0 - F ) * attenuatedColor, 1.0 - ( 1.0 - transmittedLight.a ) * transmittanceFactor );
	}
#endif`,Zf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_SPECULARMAP
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Jf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	varying vec2 vUv;
#endif
#ifdef USE_MAP
	uniform mat3 mapTransform;
	varying vec2 vMapUv;
#endif
#ifdef USE_ALPHAMAP
	uniform mat3 alphaMapTransform;
	varying vec2 vAlphaMapUv;
#endif
#ifdef USE_LIGHTMAP
	uniform mat3 lightMapTransform;
	varying vec2 vLightMapUv;
#endif
#ifdef USE_AOMAP
	uniform mat3 aoMapTransform;
	varying vec2 vAoMapUv;
#endif
#ifdef USE_BUMPMAP
	uniform mat3 bumpMapTransform;
	varying vec2 vBumpMapUv;
#endif
#ifdef USE_NORMALMAP
	uniform mat3 normalMapTransform;
	varying vec2 vNormalMapUv;
#endif
#ifdef USE_DISPLACEMENTMAP
	uniform mat3 displacementMapTransform;
	varying vec2 vDisplacementMapUv;
#endif
#ifdef USE_EMISSIVEMAP
	uniform mat3 emissiveMapTransform;
	varying vec2 vEmissiveMapUv;
#endif
#ifdef USE_METALNESSMAP
	uniform mat3 metalnessMapTransform;
	varying vec2 vMetalnessMapUv;
#endif
#ifdef USE_ROUGHNESSMAP
	uniform mat3 roughnessMapTransform;
	varying vec2 vRoughnessMapUv;
#endif
#ifdef USE_ANISOTROPYMAP
	uniform mat3 anisotropyMapTransform;
	varying vec2 vAnisotropyMapUv;
#endif
#ifdef USE_CLEARCOATMAP
	uniform mat3 clearcoatMapTransform;
	varying vec2 vClearcoatMapUv;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	uniform mat3 clearcoatNormalMapTransform;
	varying vec2 vClearcoatNormalMapUv;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	uniform mat3 clearcoatRoughnessMapTransform;
	varying vec2 vClearcoatRoughnessMapUv;
#endif
#ifdef USE_SHEEN_COLORMAP
	uniform mat3 sheenColorMapTransform;
	varying vec2 vSheenColorMapUv;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	uniform mat3 sheenRoughnessMapTransform;
	varying vec2 vSheenRoughnessMapUv;
#endif
#ifdef USE_IRIDESCENCEMAP
	uniform mat3 iridescenceMapTransform;
	varying vec2 vIridescenceMapUv;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	uniform mat3 iridescenceThicknessMapTransform;
	varying vec2 vIridescenceThicknessMapUv;
#endif
#ifdef USE_SPECULARMAP
	uniform mat3 specularMapTransform;
	varying vec2 vSpecularMapUv;
#endif
#ifdef USE_SPECULAR_COLORMAP
	uniform mat3 specularColorMapTransform;
	varying vec2 vSpecularColorMapUv;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	uniform mat3 specularIntensityMapTransform;
	varying vec2 vSpecularIntensityMapUv;
#endif
#ifdef USE_TRANSMISSIONMAP
	uniform mat3 transmissionMapTransform;
	varying vec2 vTransmissionMapUv;
#endif
#ifdef USE_THICKNESSMAP
	uniform mat3 thicknessMapTransform;
	varying vec2 vThicknessMapUv;
#endif`,Kf=`#if defined( USE_UV ) || defined( USE_ANISOTROPY )
	vUv = vec3( uv, 1 ).xy;
#endif
#ifdef USE_MAP
	vMapUv = ( mapTransform * vec3( MAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ALPHAMAP
	vAlphaMapUv = ( alphaMapTransform * vec3( ALPHAMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_LIGHTMAP
	vLightMapUv = ( lightMapTransform * vec3( LIGHTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_AOMAP
	vAoMapUv = ( aoMapTransform * vec3( AOMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_BUMPMAP
	vBumpMapUv = ( bumpMapTransform * vec3( BUMPMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_NORMALMAP
	vNormalMapUv = ( normalMapTransform * vec3( NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_DISPLACEMENTMAP
	vDisplacementMapUv = ( displacementMapTransform * vec3( DISPLACEMENTMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_EMISSIVEMAP
	vEmissiveMapUv = ( emissiveMapTransform * vec3( EMISSIVEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_METALNESSMAP
	vMetalnessMapUv = ( metalnessMapTransform * vec3( METALNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ROUGHNESSMAP
	vRoughnessMapUv = ( roughnessMapTransform * vec3( ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_ANISOTROPYMAP
	vAnisotropyMapUv = ( anisotropyMapTransform * vec3( ANISOTROPYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOATMAP
	vClearcoatMapUv = ( clearcoatMapTransform * vec3( CLEARCOATMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_NORMALMAP
	vClearcoatNormalMapUv = ( clearcoatNormalMapTransform * vec3( CLEARCOAT_NORMALMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_CLEARCOAT_ROUGHNESSMAP
	vClearcoatRoughnessMapUv = ( clearcoatRoughnessMapTransform * vec3( CLEARCOAT_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCEMAP
	vIridescenceMapUv = ( iridescenceMapTransform * vec3( IRIDESCENCEMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_IRIDESCENCE_THICKNESSMAP
	vIridescenceThicknessMapUv = ( iridescenceThicknessMapTransform * vec3( IRIDESCENCE_THICKNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_COLORMAP
	vSheenColorMapUv = ( sheenColorMapTransform * vec3( SHEEN_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SHEEN_ROUGHNESSMAP
	vSheenRoughnessMapUv = ( sheenRoughnessMapTransform * vec3( SHEEN_ROUGHNESSMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULARMAP
	vSpecularMapUv = ( specularMapTransform * vec3( SPECULARMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_COLORMAP
	vSpecularColorMapUv = ( specularColorMapTransform * vec3( SPECULAR_COLORMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_SPECULAR_INTENSITYMAP
	vSpecularIntensityMapUv = ( specularIntensityMapTransform * vec3( SPECULAR_INTENSITYMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_TRANSMISSIONMAP
	vTransmissionMapUv = ( transmissionMapTransform * vec3( TRANSMISSIONMAP_UV, 1 ) ).xy;
#endif
#ifdef USE_THICKNESSMAP
	vThicknessMapUv = ( thicknessMapTransform * vec3( THICKNESSMAP_UV, 1 ) ).xy;
#endif`,jf=`#if defined( USE_ENVMAP ) || defined( DISTANCE ) || defined ( USE_SHADOWMAP ) || defined ( USE_TRANSMISSION ) || NUM_SPOT_LIGHT_COORDS > 0
	vec4 worldPosition = vec4( transformed, 1.0 );
	#ifdef USE_BATCHING
		worldPosition = batchingMatrix * worldPosition;
	#endif
	#ifdef USE_INSTANCING
		worldPosition = instanceMatrix * worldPosition;
	#endif
	worldPosition = modelMatrix * worldPosition;
#endif`,Qf=`varying vec2 vUv;
uniform mat3 uvTransform;
void main() {
	vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	gl_Position = vec4( position.xy, 1.0, 1.0 );
}`,tm=`uniform sampler2D t2D;
uniform float backgroundIntensity;
varying vec2 vUv;
void main() {
	vec4 texColor = texture2D( t2D, vUv );
	#ifdef DECODE_VIDEO_TEXTURE
		texColor = vec4( mix( pow( texColor.rgb * 0.9478672986 + vec3( 0.0521327014 ), vec3( 2.4 ) ), texColor.rgb * 0.0773993808, vec3( lessThanEqual( texColor.rgb, vec3( 0.04045 ) ) ) ), texColor.w );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,em=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,nm=`#ifdef ENVMAP_TYPE_CUBE
	uniform samplerCube envMap;
#elif defined( ENVMAP_TYPE_CUBE_UV )
	uniform sampler2D envMap;
#endif
uniform float flipEnvMap;
uniform float backgroundBlurriness;
uniform float backgroundIntensity;
uniform mat3 backgroundRotation;
varying vec3 vWorldDirection;
#include <cube_uv_reflection_fragment>
void main() {
	#ifdef ENVMAP_TYPE_CUBE
		vec4 texColor = textureCube( envMap, backgroundRotation * vec3( flipEnvMap * vWorldDirection.x, vWorldDirection.yz ) );
	#elif defined( ENVMAP_TYPE_CUBE_UV )
		vec4 texColor = textureCubeUV( envMap, backgroundRotation * vWorldDirection, backgroundBlurriness );
	#else
		vec4 texColor = vec4( 0.0, 0.0, 0.0, 1.0 );
	#endif
	texColor.rgb *= backgroundIntensity;
	gl_FragColor = texColor;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,im=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
	gl_Position.z = gl_Position.w;
}`,sm=`uniform samplerCube tCube;
uniform float tFlip;
uniform float opacity;
varying vec3 vWorldDirection;
void main() {
	vec4 texColor = textureCube( tCube, vec3( tFlip * vWorldDirection.x, vWorldDirection.yz ) );
	gl_FragColor = texColor;
	gl_FragColor.a *= opacity;
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,rm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
varying vec2 vHighPrecisionZW;
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vHighPrecisionZW = gl_Position.zw;
}`,am=`#if DEPTH_PACKING == 3200
	uniform float opacity;
#endif
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
varying vec2 vHighPrecisionZW;
void main() {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#if DEPTH_PACKING == 3200
		diffuseColor.a = opacity;
	#endif
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <logdepthbuf_fragment>
	#ifdef USE_REVERSED_DEPTH_BUFFER
		float fragCoordZ = vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ];
	#else
		float fragCoordZ = 0.5 * vHighPrecisionZW[ 0 ] / vHighPrecisionZW[ 1 ] + 0.5;
	#endif
	#if DEPTH_PACKING == 3200
		gl_FragColor = vec4( vec3( 1.0 - fragCoordZ ), opacity );
	#elif DEPTH_PACKING == 3201
		gl_FragColor = packDepthToRGBA( fragCoordZ );
	#elif DEPTH_PACKING == 3202
		gl_FragColor = vec4( packDepthToRGB( fragCoordZ ), 1.0 );
	#elif DEPTH_PACKING == 3203
		gl_FragColor = vec4( packDepthToRG( fragCoordZ ), 0.0, 1.0 );
	#endif
}`,om=`#define DISTANCE
varying vec3 vWorldPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <skinbase_vertex>
	#include <morphinstance_vertex>
	#ifdef USE_DISPLACEMENTMAP
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <worldpos_vertex>
	#include <clipping_planes_vertex>
	vWorldPosition = worldPosition.xyz;
}`,lm=`#define DISTANCE
uniform vec3 referencePosition;
uniform float nearDistance;
uniform float farDistance;
varying vec3 vWorldPosition;
#include <common>
#include <packing>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <clipping_planes_pars_fragment>
void main () {
	vec4 diffuseColor = vec4( 1.0 );
	#include <clipping_planes_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	float dist = length( vWorldPosition - referencePosition );
	dist = ( dist - nearDistance ) / ( farDistance - nearDistance );
	dist = saturate( dist );
	gl_FragColor = packDepthToRGBA( dist );
}`,cm=`varying vec3 vWorldDirection;
#include <common>
void main() {
	vWorldDirection = transformDirection( position, modelMatrix );
	#include <begin_vertex>
	#include <project_vertex>
}`,hm=`uniform sampler2D tEquirect;
varying vec3 vWorldDirection;
#include <common>
void main() {
	vec3 direction = normalize( vWorldDirection );
	vec2 sampleUV = equirectUv( direction );
	gl_FragColor = texture2D( tEquirect, sampleUV );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
}`,dm=`uniform float scale;
attribute float lineDistance;
varying float vLineDistance;
#include <common>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	vLineDistance = scale * lineDistance;
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,um=`uniform vec3 diffuse;
uniform float opacity;
uniform float dashSize;
uniform float totalSize;
varying float vLineDistance;
#include <common>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	if ( mod( vLineDistance, totalSize ) > dashSize ) {
		discard;
	}
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,pm=`#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#if defined ( USE_ENVMAP ) || defined ( USE_SKINNING )
		#include <beginnormal_vertex>
		#include <morphnormal_vertex>
		#include <skinbase_vertex>
		#include <skinnormal_vertex>
		#include <defaultnormal_vertex>
	#endif
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <fog_vertex>
}`,fm=`uniform vec3 diffuse;
uniform float opacity;
#ifndef FLAT_SHADED
	varying vec3 vNormal;
#endif
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	#ifdef USE_LIGHTMAP
		vec4 lightMapTexel = texture2D( lightMap, vLightMapUv );
		reflectedLight.indirectDiffuse += lightMapTexel.rgb * lightMapIntensity * RECIPROCAL_PI;
	#else
		reflectedLight.indirectDiffuse += vec3( 1.0 );
	#endif
	#include <aomap_fragment>
	reflectedLight.indirectDiffuse *= diffuseColor.rgb;
	vec3 outgoingLight = reflectedLight.indirectDiffuse;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,mm=`#define LAMBERT
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,gm=`#define LAMBERT
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_lambert_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_lambert_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,_m=`#define MATCAP
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <color_pars_vertex>
#include <displacementmap_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
	vViewPosition = - mvPosition.xyz;
}`,xm=`#define MATCAP
uniform vec3 diffuse;
uniform float opacity;
uniform sampler2D matcap;
varying vec3 vViewPosition;
#include <common>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	vec3 viewDir = normalize( vViewPosition );
	vec3 x = normalize( vec3( viewDir.z, 0.0, - viewDir.x ) );
	vec3 y = cross( viewDir, x );
	vec2 uv = vec2( dot( x, normal ), dot( y, normal ) ) * 0.495 + 0.5;
	#ifdef USE_MATCAP
		vec4 matcapColor = texture2D( matcap, uv );
	#else
		vec4 matcapColor = vec4( vec3( mix( 0.2, 0.8, uv.y ) ), 1.0 );
	#endif
	vec3 outgoingLight = diffuseColor.rgb * matcapColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,ym=`#define NORMAL
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	vViewPosition = - mvPosition.xyz;
#endif
}`,vm=`#define NORMAL
uniform float opacity;
#if defined( FLAT_SHADED ) || defined( USE_BUMPMAP ) || defined( USE_NORMALMAP_TANGENTSPACE )
	varying vec3 vViewPosition;
#endif
#include <packing>
#include <uv_pars_fragment>
#include <normal_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( 0.0, 0.0, 0.0, opacity );
	#include <clipping_planes_fragment>
	#include <logdepthbuf_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	gl_FragColor = vec4( packNormalToRGB( normal ), diffuseColor.a );
	#ifdef OPAQUE
		gl_FragColor.a = 1.0;
	#endif
}`,bm=`#define PHONG
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <envmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <envmap_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Mm=`#define PHONG
uniform vec3 diffuse;
uniform vec3 emissive;
uniform vec3 specular;
uniform float shininess;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_phong_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <specularmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <specularmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_phong_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + reflectedLight.directSpecular + reflectedLight.indirectSpecular + totalEmissiveRadiance;
	#include <envmap_fragment>
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Sm=`#define STANDARD
varying vec3 vViewPosition;
#ifdef USE_TRANSMISSION
	varying vec3 vWorldPosition;
#endif
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
#ifdef USE_TRANSMISSION
	vWorldPosition = worldPosition.xyz;
#endif
}`,wm=`#define STANDARD
#ifdef PHYSICAL
	#define IOR
	#define USE_SPECULAR
#endif
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float roughness;
uniform float metalness;
uniform float opacity;
#ifdef IOR
	uniform float ior;
#endif
#ifdef USE_SPECULAR
	uniform float specularIntensity;
	uniform vec3 specularColor;
	#ifdef USE_SPECULAR_COLORMAP
		uniform sampler2D specularColorMap;
	#endif
	#ifdef USE_SPECULAR_INTENSITYMAP
		uniform sampler2D specularIntensityMap;
	#endif
#endif
#ifdef USE_CLEARCOAT
	uniform float clearcoat;
	uniform float clearcoatRoughness;
#endif
#ifdef USE_DISPERSION
	uniform float dispersion;
#endif
#ifdef USE_IRIDESCENCE
	uniform float iridescence;
	uniform float iridescenceIOR;
	uniform float iridescenceThicknessMinimum;
	uniform float iridescenceThicknessMaximum;
#endif
#ifdef USE_SHEEN
	uniform vec3 sheenColor;
	uniform float sheenRoughness;
	#ifdef USE_SHEEN_COLORMAP
		uniform sampler2D sheenColorMap;
	#endif
	#ifdef USE_SHEEN_ROUGHNESSMAP
		uniform sampler2D sheenRoughnessMap;
	#endif
#endif
#ifdef USE_ANISOTROPY
	uniform vec2 anisotropyVector;
	#ifdef USE_ANISOTROPYMAP
		uniform sampler2D anisotropyMap;
	#endif
#endif
varying vec3 vViewPosition;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <iridescence_fragment>
#include <cube_uv_reflection_fragment>
#include <envmap_common_pars_fragment>
#include <envmap_physical_pars_fragment>
#include <fog_pars_fragment>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_physical_pars_fragment>
#include <transmission_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <clearcoat_pars_fragment>
#include <iridescence_pars_fragment>
#include <roughnessmap_pars_fragment>
#include <metalnessmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <roughnessmap_fragment>
	#include <metalnessmap_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <clearcoat_normal_fragment_begin>
	#include <clearcoat_normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_physical_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 totalDiffuse = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse;
	vec3 totalSpecular = reflectedLight.directSpecular + reflectedLight.indirectSpecular;
	#include <transmission_fragment>
	vec3 outgoingLight = totalDiffuse + totalSpecular + totalEmissiveRadiance;
	#ifdef USE_SHEEN
		float sheenEnergyComp = 1.0 - 0.157 * max3( material.sheenColor );
		outgoingLight = outgoingLight * sheenEnergyComp + sheenSpecularDirect + sheenSpecularIndirect;
	#endif
	#ifdef USE_CLEARCOAT
		float dotNVcc = saturate( dot( geometryClearcoatNormal, geometryViewDir ) );
		vec3 Fcc = F_Schlick( material.clearcoatF0, material.clearcoatF90, dotNVcc );
		outgoingLight = outgoingLight * ( 1.0 - material.clearcoat * Fcc ) + ( clearcoatSpecularDirect + clearcoatSpecularIndirect ) * material.clearcoat;
	#endif
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Em=`#define TOON
varying vec3 vViewPosition;
#include <common>
#include <batching_pars_vertex>
#include <uv_pars_vertex>
#include <displacementmap_pars_vertex>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <normal_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <shadowmap_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <normal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <displacementmap_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	vViewPosition = - mvPosition.xyz;
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Tm=`#define TOON
uniform vec3 diffuse;
uniform vec3 emissive;
uniform float opacity;
#include <common>
#include <packing>
#include <dithering_pars_fragment>
#include <color_pars_fragment>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <aomap_pars_fragment>
#include <lightmap_pars_fragment>
#include <emissivemap_pars_fragment>
#include <gradientmap_pars_fragment>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <normal_pars_fragment>
#include <lights_toon_pars_fragment>
#include <shadowmap_pars_fragment>
#include <bumpmap_pars_fragment>
#include <normalmap_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	ReflectedLight reflectedLight = ReflectedLight( vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ), vec3( 0.0 ) );
	vec3 totalEmissiveRadiance = emissive;
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <color_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	#include <normal_fragment_begin>
	#include <normal_fragment_maps>
	#include <emissivemap_fragment>
	#include <lights_toon_fragment>
	#include <lights_fragment_begin>
	#include <lights_fragment_maps>
	#include <lights_fragment_end>
	#include <aomap_fragment>
	vec3 outgoingLight = reflectedLight.directDiffuse + reflectedLight.indirectDiffuse + totalEmissiveRadiance;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
	#include <dithering_fragment>
}`,Am=`uniform float size;
uniform float scale;
#include <common>
#include <color_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
#ifdef USE_POINTS_UV
	varying vec2 vUv;
	uniform mat3 uvTransform;
#endif
void main() {
	#ifdef USE_POINTS_UV
		vUv = ( uvTransform * vec3( uv, 1 ) ).xy;
	#endif
	#include <color_vertex>
	#include <morphinstance_vertex>
	#include <morphcolor_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <project_vertex>
	gl_PointSize = size;
	#ifdef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) gl_PointSize *= ( scale / - mvPosition.z );
	#endif
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <worldpos_vertex>
	#include <fog_vertex>
}`,Cm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <color_pars_fragment>
#include <map_particle_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_particle_fragment>
	#include <color_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
	#include <premultiplied_alpha_fragment>
}`,Rm=`#include <common>
#include <batching_pars_vertex>
#include <fog_pars_vertex>
#include <morphtarget_pars_vertex>
#include <skinning_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <shadowmap_pars_vertex>
void main() {
	#include <batching_vertex>
	#include <beginnormal_vertex>
	#include <morphinstance_vertex>
	#include <morphnormal_vertex>
	#include <skinbase_vertex>
	#include <skinnormal_vertex>
	#include <defaultnormal_vertex>
	#include <begin_vertex>
	#include <morphtarget_vertex>
	#include <skinning_vertex>
	#include <project_vertex>
	#include <logdepthbuf_vertex>
	#include <worldpos_vertex>
	#include <shadowmap_vertex>
	#include <fog_vertex>
}`,Pm=`uniform vec3 color;
uniform float opacity;
#include <common>
#include <packing>
#include <fog_pars_fragment>
#include <bsdfs>
#include <lights_pars_begin>
#include <logdepthbuf_pars_fragment>
#include <shadowmap_pars_fragment>
#include <shadowmask_pars_fragment>
void main() {
	#include <logdepthbuf_fragment>
	gl_FragColor = vec4( color, opacity * ( 1.0 - getShadowMask() ) );
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Im=`uniform float rotation;
uniform vec2 center;
#include <common>
#include <uv_pars_vertex>
#include <fog_pars_vertex>
#include <logdepthbuf_pars_vertex>
#include <clipping_planes_pars_vertex>
void main() {
	#include <uv_vertex>
	vec4 mvPosition = modelViewMatrix[ 3 ];
	vec2 scale = vec2( length( modelMatrix[ 0 ].xyz ), length( modelMatrix[ 1 ].xyz ) );
	#ifndef USE_SIZEATTENUATION
		bool isPerspective = isPerspectiveMatrix( projectionMatrix );
		if ( isPerspective ) scale *= - mvPosition.z;
	#endif
	vec2 alignedPosition = ( position.xy - ( center - vec2( 0.5 ) ) ) * scale;
	vec2 rotatedPosition;
	rotatedPosition.x = cos( rotation ) * alignedPosition.x - sin( rotation ) * alignedPosition.y;
	rotatedPosition.y = sin( rotation ) * alignedPosition.x + cos( rotation ) * alignedPosition.y;
	mvPosition.xy += rotatedPosition;
	gl_Position = projectionMatrix * mvPosition;
	#include <logdepthbuf_vertex>
	#include <clipping_planes_vertex>
	#include <fog_vertex>
}`,Lm=`uniform vec3 diffuse;
uniform float opacity;
#include <common>
#include <uv_pars_fragment>
#include <map_pars_fragment>
#include <alphamap_pars_fragment>
#include <alphatest_pars_fragment>
#include <alphahash_pars_fragment>
#include <fog_pars_fragment>
#include <logdepthbuf_pars_fragment>
#include <clipping_planes_pars_fragment>
void main() {
	vec4 diffuseColor = vec4( diffuse, opacity );
	#include <clipping_planes_fragment>
	vec3 outgoingLight = vec3( 0.0 );
	#include <logdepthbuf_fragment>
	#include <map_fragment>
	#include <alphamap_fragment>
	#include <alphatest_fragment>
	#include <alphahash_fragment>
	outgoingLight = diffuseColor.rgb;
	#include <opaque_fragment>
	#include <tonemapping_fragment>
	#include <colorspace_fragment>
	#include <fog_fragment>
}`,Vt={alphahash_fragment:Qu,alphahash_pars_fragment:tp,alphamap_fragment:ep,alphamap_pars_fragment:np,alphatest_fragment:ip,alphatest_pars_fragment:sp,aomap_fragment:rp,aomap_pars_fragment:ap,batching_pars_vertex:op,batching_vertex:lp,begin_vertex:cp,beginnormal_vertex:hp,bsdfs:dp,iridescence_fragment:up,bumpmap_pars_fragment:pp,clipping_planes_fragment:fp,clipping_planes_pars_fragment:mp,clipping_planes_pars_vertex:gp,clipping_planes_vertex:_p,color_fragment:xp,color_pars_fragment:yp,color_pars_vertex:vp,color_vertex:bp,common:Mp,cube_uv_reflection_fragment:Sp,defaultnormal_vertex:wp,displacementmap_pars_vertex:Ep,displacementmap_vertex:Tp,emissivemap_fragment:Ap,emissivemap_pars_fragment:Cp,colorspace_fragment:Rp,colorspace_pars_fragment:Pp,envmap_fragment:Ip,envmap_common_pars_fragment:Lp,envmap_pars_fragment:Dp,envmap_pars_vertex:Np,envmap_physical_pars_fragment:Xp,envmap_vertex:Up,fog_vertex:Fp,fog_pars_vertex:Op,fog_fragment:Bp,fog_pars_fragment:zp,gradientmap_pars_fragment:kp,lightmap_pars_fragment:Vp,lights_lambert_fragment:Hp,lights_lambert_pars_fragment:Gp,lights_pars_begin:Wp,lights_toon_fragment:$p,lights_toon_pars_fragment:qp,lights_phong_fragment:Yp,lights_phong_pars_fragment:Zp,lights_physical_fragment:Jp,lights_physical_pars_fragment:Kp,lights_fragment_begin:jp,lights_fragment_maps:Qp,lights_fragment_end:tf,logdepthbuf_fragment:ef,logdepthbuf_pars_fragment:nf,logdepthbuf_pars_vertex:sf,logdepthbuf_vertex:rf,map_fragment:af,map_pars_fragment:of,map_particle_fragment:lf,map_particle_pars_fragment:cf,metalnessmap_fragment:hf,metalnessmap_pars_fragment:df,morphinstance_vertex:uf,morphcolor_vertex:pf,morphnormal_vertex:ff,morphtarget_pars_vertex:mf,morphtarget_vertex:gf,normal_fragment_begin:_f,normal_fragment_maps:xf,normal_pars_fragment:yf,normal_pars_vertex:vf,normal_vertex:bf,normalmap_pars_fragment:Mf,clearcoat_normal_fragment_begin:Sf,clearcoat_normal_fragment_maps:wf,clearcoat_pars_fragment:Ef,iridescence_pars_fragment:Tf,opaque_fragment:Af,packing:Cf,premultiplied_alpha_fragment:Rf,project_vertex:Pf,dithering_fragment:If,dithering_pars_fragment:Lf,roughnessmap_fragment:Df,roughnessmap_pars_fragment:Nf,shadowmap_pars_fragment:Uf,shadowmap_pars_vertex:Ff,shadowmap_vertex:Of,shadowmask_pars_fragment:Bf,skinbase_vertex:zf,skinning_pars_vertex:kf,skinning_vertex:Vf,skinnormal_vertex:Hf,specularmap_fragment:Gf,specularmap_pars_fragment:Wf,tonemapping_fragment:Xf,tonemapping_pars_fragment:$f,transmission_fragment:qf,transmission_pars_fragment:Yf,uv_pars_fragment:Zf,uv_pars_vertex:Jf,uv_vertex:Kf,worldpos_vertex:jf,background_vert:Qf,background_frag:tm,backgroundCube_vert:em,backgroundCube_frag:nm,cube_vert:im,cube_frag:sm,depth_vert:rm,depth_frag:am,distanceRGBA_vert:om,distanceRGBA_frag:lm,equirect_vert:cm,equirect_frag:hm,linedashed_vert:dm,linedashed_frag:um,meshbasic_vert:pm,meshbasic_frag:fm,meshlambert_vert:mm,meshlambert_frag:gm,meshmatcap_vert:_m,meshmatcap_frag:xm,meshnormal_vert:ym,meshnormal_frag:vm,meshphong_vert:bm,meshphong_frag:Mm,meshphysical_vert:Sm,meshphysical_frag:wm,meshtoon_vert:Em,meshtoon_frag:Tm,points_vert:Am,points_frag:Cm,shadow_vert:Rm,shadow_frag:Pm,sprite_vert:Im,sprite_frag:Lm},ot={common:{diffuse:{value:new kt(16777215)},opacity:{value:1},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}},specularmap:{specularMap:{value:null},specularMapTransform:{value:new Ot}},envmap:{envMap:{value:null},envMapRotation:{value:new Ot},flipEnvMap:{value:-1},reflectivity:{value:1},ior:{value:1.5},refractionRatio:{value:.98}},aomap:{aoMap:{value:null},aoMapIntensity:{value:1},aoMapTransform:{value:new Ot}},lightmap:{lightMap:{value:null},lightMapIntensity:{value:1},lightMapTransform:{value:new Ot}},bumpmap:{bumpMap:{value:null},bumpMapTransform:{value:new Ot},bumpScale:{value:1}},normalmap:{normalMap:{value:null},normalMapTransform:{value:new Ot},normalScale:{value:new Dt(1,1)}},displacementmap:{displacementMap:{value:null},displacementMapTransform:{value:new Ot},displacementScale:{value:1},displacementBias:{value:0}},emissivemap:{emissiveMap:{value:null},emissiveMapTransform:{value:new Ot}},metalnessmap:{metalnessMap:{value:null},metalnessMapTransform:{value:new Ot}},roughnessmap:{roughnessMap:{value:null},roughnessMapTransform:{value:new Ot}},gradientmap:{gradientMap:{value:null}},fog:{fogDensity:{value:25e-5},fogNear:{value:1},fogFar:{value:2e3},fogColor:{value:new kt(16777215)}},lights:{ambientLightColor:{value:[]},lightProbe:{value:[]},directionalLights:{value:[],properties:{direction:{},color:{}}},directionalLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},directionalShadowMap:{value:[]},directionalShadowMatrix:{value:[]},spotLights:{value:[],properties:{color:{},position:{},direction:{},distance:{},coneCos:{},penumbraCos:{},decay:{}}},spotLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{}}},spotLightMap:{value:[]},spotShadowMap:{value:[]},spotLightMatrix:{value:[]},pointLights:{value:[],properties:{color:{},position:{},decay:{},distance:{}}},pointLightShadows:{value:[],properties:{shadowIntensity:1,shadowBias:{},shadowNormalBias:{},shadowRadius:{},shadowMapSize:{},shadowCameraNear:{},shadowCameraFar:{}}},pointShadowMap:{value:[]},pointShadowMatrix:{value:[]},hemisphereLights:{value:[],properties:{direction:{},skyColor:{},groundColor:{}}},rectAreaLights:{value:[],properties:{color:{},position:{},width:{},height:{}}},ltc_1:{value:null},ltc_2:{value:null}},points:{diffuse:{value:new kt(16777215)},opacity:{value:1},size:{value:1},scale:{value:1},map:{value:null},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0},uvTransform:{value:new Ot}},sprite:{diffuse:{value:new kt(16777215)},opacity:{value:1},center:{value:new Dt(.5,.5)},rotation:{value:0},map:{value:null},mapTransform:{value:new Ot},alphaMap:{value:null},alphaMapTransform:{value:new Ot},alphaTest:{value:0}}},Cn={basic:{uniforms:Fe([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.fog]),vertexShader:Vt.meshbasic_vert,fragmentShader:Vt.meshbasic_frag},lambert:{uniforms:Fe([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new kt(0)}}]),vertexShader:Vt.meshlambert_vert,fragmentShader:Vt.meshlambert_frag},phong:{uniforms:Fe([ot.common,ot.specularmap,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,ot.lights,{emissive:{value:new kt(0)},specular:{value:new kt(1118481)},shininess:{value:30}}]),vertexShader:Vt.meshphong_vert,fragmentShader:Vt.meshphong_frag},standard:{uniforms:Fe([ot.common,ot.envmap,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.roughnessmap,ot.metalnessmap,ot.fog,ot.lights,{emissive:{value:new kt(0)},roughness:{value:1},metalness:{value:0},envMapIntensity:{value:1}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag},toon:{uniforms:Fe([ot.common,ot.aomap,ot.lightmap,ot.emissivemap,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.gradientmap,ot.fog,ot.lights,{emissive:{value:new kt(0)}}]),vertexShader:Vt.meshtoon_vert,fragmentShader:Vt.meshtoon_frag},matcap:{uniforms:Fe([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,ot.fog,{matcap:{value:null}}]),vertexShader:Vt.meshmatcap_vert,fragmentShader:Vt.meshmatcap_frag},points:{uniforms:Fe([ot.points,ot.fog]),vertexShader:Vt.points_vert,fragmentShader:Vt.points_frag},dashed:{uniforms:Fe([ot.common,ot.fog,{scale:{value:1},dashSize:{value:1},totalSize:{value:2}}]),vertexShader:Vt.linedashed_vert,fragmentShader:Vt.linedashed_frag},depth:{uniforms:Fe([ot.common,ot.displacementmap]),vertexShader:Vt.depth_vert,fragmentShader:Vt.depth_frag},normal:{uniforms:Fe([ot.common,ot.bumpmap,ot.normalmap,ot.displacementmap,{opacity:{value:1}}]),vertexShader:Vt.meshnormal_vert,fragmentShader:Vt.meshnormal_frag},sprite:{uniforms:Fe([ot.sprite,ot.fog]),vertexShader:Vt.sprite_vert,fragmentShader:Vt.sprite_frag},background:{uniforms:{uvTransform:{value:new Ot},t2D:{value:null},backgroundIntensity:{value:1}},vertexShader:Vt.background_vert,fragmentShader:Vt.background_frag},backgroundCube:{uniforms:{envMap:{value:null},flipEnvMap:{value:-1},backgroundBlurriness:{value:0},backgroundIntensity:{value:1},backgroundRotation:{value:new Ot}},vertexShader:Vt.backgroundCube_vert,fragmentShader:Vt.backgroundCube_frag},cube:{uniforms:{tCube:{value:null},tFlip:{value:-1},opacity:{value:1}},vertexShader:Vt.cube_vert,fragmentShader:Vt.cube_frag},equirect:{uniforms:{tEquirect:{value:null}},vertexShader:Vt.equirect_vert,fragmentShader:Vt.equirect_frag},distanceRGBA:{uniforms:Fe([ot.common,ot.displacementmap,{referencePosition:{value:new L},nearDistance:{value:1},farDistance:{value:1e3}}]),vertexShader:Vt.distanceRGBA_vert,fragmentShader:Vt.distanceRGBA_frag},shadow:{uniforms:Fe([ot.lights,ot.fog,{color:{value:new kt(0)},opacity:{value:1}}]),vertexShader:Vt.shadow_vert,fragmentShader:Vt.shadow_frag}};Cn.physical={uniforms:Fe([Cn.standard.uniforms,{clearcoat:{value:0},clearcoatMap:{value:null},clearcoatMapTransform:{value:new Ot},clearcoatNormalMap:{value:null},clearcoatNormalMapTransform:{value:new Ot},clearcoatNormalScale:{value:new Dt(1,1)},clearcoatRoughness:{value:0},clearcoatRoughnessMap:{value:null},clearcoatRoughnessMapTransform:{value:new Ot},dispersion:{value:0},iridescence:{value:0},iridescenceMap:{value:null},iridescenceMapTransform:{value:new Ot},iridescenceIOR:{value:1.3},iridescenceThicknessMinimum:{value:100},iridescenceThicknessMaximum:{value:400},iridescenceThicknessMap:{value:null},iridescenceThicknessMapTransform:{value:new Ot},sheen:{value:0},sheenColor:{value:new kt(0)},sheenColorMap:{value:null},sheenColorMapTransform:{value:new Ot},sheenRoughness:{value:1},sheenRoughnessMap:{value:null},sheenRoughnessMapTransform:{value:new Ot},transmission:{value:0},transmissionMap:{value:null},transmissionMapTransform:{value:new Ot},transmissionSamplerSize:{value:new Dt},transmissionSamplerMap:{value:null},thickness:{value:0},thicknessMap:{value:null},thicknessMapTransform:{value:new Ot},attenuationDistance:{value:0},attenuationColor:{value:new kt(0)},specularColor:{value:new kt(1,1,1)},specularColorMap:{value:null},specularColorMapTransform:{value:new Ot},specularIntensity:{value:1},specularIntensityMap:{value:null},specularIntensityMapTransform:{value:new Ot},anisotropyVector:{value:new Dt},anisotropyMap:{value:null},anisotropyMapTransform:{value:new Ot}}]),vertexShader:Vt.meshphysical_vert,fragmentShader:Vt.meshphysical_frag};var ho={r:0,b:0,g:0},Pi=new gn,Dm=new Jt;function Nm(i,t,e,n,s,r,a){let o=new kt(0),l=r===!0?0:1,c,u,d=null,h=0,f=null;function _(E){let M=E.isScene===!0?E.background:null;return M&&M.isTexture&&(M=(E.backgroundBlurriness>0?e:t).get(M)),M}function y(E){let M=!1,P=_(E);P===null?p(o,l):P&&P.isColor&&(p(P,1),M=!0);let R=i.xr.getEnvironmentBlendMode();R==="additive"?n.buffers.color.setClear(0,0,0,1,a):R==="alpha-blend"&&n.buffers.color.setClear(0,0,0,0,a),(i.autoClear||M)&&(n.buffers.depth.setTest(!0),n.buffers.depth.setMask(!0),n.buffers.color.setMask(!0),i.clear(i.autoClearColor,i.autoClearDepth,i.autoClearStencil))}function m(E,M){let P=_(M);P&&(P.isCubeTexture||P.mapping===ir)?(u===void 0&&(u=new Te(new rs(1,1,1),new _n({name:"BackgroundCubeMaterial",uniforms:Ri(Cn.backgroundCube.uniforms),vertexShader:Cn.backgroundCube.vertexShader,fragmentShader:Cn.backgroundCube.fragmentShader,side:ke,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),u.geometry.deleteAttribute("normal"),u.geometry.deleteAttribute("uv"),u.onBeforeRender=function(R,C,B){this.matrixWorld.copyPosition(B.matrixWorld)},Object.defineProperty(u.material,"envMap",{get:function(){return this.uniforms.envMap.value}}),s.update(u)),Pi.copy(M.backgroundRotation),Pi.x*=-1,Pi.y*=-1,Pi.z*=-1,P.isCubeTexture&&P.isRenderTargetTexture===!1&&(Pi.y*=-1,Pi.z*=-1),u.material.uniforms.envMap.value=P,u.material.uniforms.flipEnvMap.value=P.isCubeTexture&&P.isRenderTargetTexture===!1?-1:1,u.material.uniforms.backgroundBlurriness.value=M.backgroundBlurriness,u.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,u.material.uniforms.backgroundRotation.value.setFromMatrix4(Dm.makeRotationFromEuler(Pi)),u.material.toneMapped=$t.getTransfer(P.colorSpace)!==Kt,(d!==P||h!==P.version||f!==i.toneMapping)&&(u.material.needsUpdate=!0,d=P,h=P.version,f=i.toneMapping),u.layers.enableAll(),E.unshift(u,u.geometry,u.material,0,0,null)):P&&P.isTexture&&(c===void 0&&(c=new Te(new wi(2,2),new _n({name:"BackgroundMaterial",uniforms:Ri(Cn.background.uniforms),vertexShader:Cn.background.vertexShader,fragmentShader:Cn.background.fragmentShader,side:Bn,depthTest:!1,depthWrite:!1,fog:!1,allowOverride:!1})),c.geometry.deleteAttribute("normal"),Object.defineProperty(c.material,"map",{get:function(){return this.uniforms.t2D.value}}),s.update(c)),c.material.uniforms.t2D.value=P,c.material.uniforms.backgroundIntensity.value=M.backgroundIntensity,c.material.toneMapped=$t.getTransfer(P.colorSpace)!==Kt,P.matrixAutoUpdate===!0&&P.updateMatrix(),c.material.uniforms.uvTransform.value.copy(P.matrix),(d!==P||h!==P.version||f!==i.toneMapping)&&(c.material.needsUpdate=!0,d=P,h=P.version,f=i.toneMapping),c.layers.enableAll(),E.unshift(c,c.geometry,c.material,0,0,null))}function p(E,M){E.getRGB(ho,Ul(i)),n.buffers.color.setClear(ho.r,ho.g,ho.b,M,a)}function w(){u!==void 0&&(u.geometry.dispose(),u.material.dispose(),u=void 0),c!==void 0&&(c.geometry.dispose(),c.material.dispose(),c=void 0)}return{getClearColor:function(){return o},setClearColor:function(E,M=1){o.set(E),l=M,p(o,l)},getClearAlpha:function(){return l},setClearAlpha:function(E){l=E,p(o,l)},render:y,addToRenderList:m,dispose:w}}function Um(i,t){let e=i.getParameter(i.MAX_VERTEX_ATTRIBS),n={},s=h(null),r=s,a=!1;function o(v,D,V,W,q){let J=!1,$=d(W,V,D);r!==$&&(r=$,c(r.object)),J=f(v,W,V,q),J&&_(v,W,V,q),q!==null&&t.update(q,i.ELEMENT_ARRAY_BUFFER),(J||a)&&(a=!1,M(v,D,V,W),q!==null&&i.bindBuffer(i.ELEMENT_ARRAY_BUFFER,t.get(q).buffer))}function l(){return i.createVertexArray()}function c(v){return i.bindVertexArray(v)}function u(v){return i.deleteVertexArray(v)}function d(v,D,V){let W=V.wireframe===!0,q=n[v.id];q===void 0&&(q={},n[v.id]=q);let J=q[D.id];J===void 0&&(J={},q[D.id]=J);let $=J[W];return $===void 0&&($=h(l()),J[W]=$),$}function h(v){let D=[],V=[],W=[];for(let q=0;q<e;q++)D[q]=0,V[q]=0,W[q]=0;return{geometry:null,program:null,wireframe:!1,newAttributes:D,enabledAttributes:V,attributeDivisors:W,object:v,attributes:{},index:null}}function f(v,D,V,W){let q=r.attributes,J=D.attributes,$=0,st=V.getAttributes();for(let H in st)if(st[H].location>=0){let pt=q[H],Tt=J[H];if(Tt===void 0&&(H==="instanceMatrix"&&v.instanceMatrix&&(Tt=v.instanceMatrix),H==="instanceColor"&&v.instanceColor&&(Tt=v.instanceColor)),pt===void 0||pt.attribute!==Tt||Tt&&pt.data!==Tt.data)return!0;$++}return r.attributesNum!==$||r.index!==W}function _(v,D,V,W){let q={},J=D.attributes,$=0,st=V.getAttributes();for(let H in st)if(st[H].location>=0){let pt=J[H];pt===void 0&&(H==="instanceMatrix"&&v.instanceMatrix&&(pt=v.instanceMatrix),H==="instanceColor"&&v.instanceColor&&(pt=v.instanceColor));let Tt={};Tt.attribute=pt,pt&&pt.data&&(Tt.data=pt.data),q[H]=Tt,$++}r.attributes=q,r.attributesNum=$,r.index=W}function y(){let v=r.newAttributes;for(let D=0,V=v.length;D<V;D++)v[D]=0}function m(v){p(v,0)}function p(v,D){let V=r.newAttributes,W=r.enabledAttributes,q=r.attributeDivisors;V[v]=1,W[v]===0&&(i.enableVertexAttribArray(v),W[v]=1),q[v]!==D&&(i.vertexAttribDivisor(v,D),q[v]=D)}function w(){let v=r.newAttributes,D=r.enabledAttributes;for(let V=0,W=D.length;V<W;V++)D[V]!==v[V]&&(i.disableVertexAttribArray(V),D[V]=0)}function E(v,D,V,W,q,J,$){$===!0?i.vertexAttribIPointer(v,D,V,q,J):i.vertexAttribPointer(v,D,V,W,q,J)}function M(v,D,V,W){y();let q=W.attributes,J=V.getAttributes(),$=D.defaultAttributeValues;for(let st in J){let H=J[st];if(H.location>=0){let lt=q[st];if(lt===void 0&&(st==="instanceMatrix"&&v.instanceMatrix&&(lt=v.instanceMatrix),st==="instanceColor"&&v.instanceColor&&(lt=v.instanceColor)),lt!==void 0){let pt=lt.normalized,Tt=lt.itemSize,Gt=t.get(lt);if(Gt===void 0)continue;let ee=Gt.buffer,re=Gt.type,Yt=Gt.bytesPerElement,Y=re===i.INT||re===i.UNSIGNED_INT||lt.gpuType===Ra;if(lt.isInterleavedBufferAttribute){let j=lt.data,gt=j.stride,Nt=lt.offset;if(j.isInstancedInterleavedBuffer){for(let Et=0;Et<H.locationSize;Et++)p(H.location+Et,j.meshPerAttribute);v.isInstancedMesh!==!0&&W._maxInstanceCount===void 0&&(W._maxInstanceCount=j.meshPerAttribute*j.count)}else for(let Et=0;Et<H.locationSize;Et++)m(H.location+Et);i.bindBuffer(i.ARRAY_BUFFER,ee);for(let Et=0;Et<H.locationSize;Et++)E(H.location+Et,Tt/H.locationSize,re,pt,gt*Yt,(Nt+Tt/H.locationSize*Et)*Yt,Y)}else{if(lt.isInstancedBufferAttribute){for(let j=0;j<H.locationSize;j++)p(H.location+j,lt.meshPerAttribute);v.isInstancedMesh!==!0&&W._maxInstanceCount===void 0&&(W._maxInstanceCount=lt.meshPerAttribute*lt.count)}else for(let j=0;j<H.locationSize;j++)m(H.location+j);i.bindBuffer(i.ARRAY_BUFFER,ee);for(let j=0;j<H.locationSize;j++)E(H.location+j,Tt/H.locationSize,re,pt,Tt*Yt,Tt/H.locationSize*j*Yt,Y)}}else if($!==void 0){let pt=$[st];if(pt!==void 0)switch(pt.length){case 2:i.vertexAttrib2fv(H.location,pt);break;case 3:i.vertexAttrib3fv(H.location,pt);break;case 4:i.vertexAttrib4fv(H.location,pt);break;default:i.vertexAttrib1fv(H.location,pt)}}}}w()}function P(){B();for(let v in n){let D=n[v];for(let V in D){let W=D[V];for(let q in W)u(W[q].object),delete W[q];delete D[V]}delete n[v]}}function R(v){if(n[v.id]===void 0)return;let D=n[v.id];for(let V in D){let W=D[V];for(let q in W)u(W[q].object),delete W[q];delete D[V]}delete n[v.id]}function C(v){for(let D in n){let V=n[D];if(V[v.id]===void 0)continue;let W=V[v.id];for(let q in W)u(W[q].object),delete W[q];delete V[v.id]}}function B(){b(),a=!0,r!==s&&(r=s,c(r.object))}function b(){s.geometry=null,s.program=null,s.wireframe=!1}return{setup:o,reset:B,resetDefaultState:b,dispose:P,releaseStatesOfGeometry:R,releaseStatesOfProgram:C,initAttributes:y,enableAttribute:m,disableUnusedAttributes:w}}function Fm(i,t,e){let n;function s(c){n=c}function r(c,u){i.drawArrays(n,c,u),e.update(u,n,1)}function a(c,u,d){d!==0&&(i.drawArraysInstanced(n,c,u,d),e.update(u,n,d))}function o(c,u,d){if(d===0)return;t.get("WEBGL_multi_draw").multiDrawArraysWEBGL(n,c,0,u,0,d);let f=0;for(let _=0;_<d;_++)f+=u[_];e.update(f,n,1)}function l(c,u,d,h){if(d===0)return;let f=t.get("WEBGL_multi_draw");if(f===null)for(let _=0;_<c.length;_++)a(c[_],u[_],h[_]);else{f.multiDrawArraysInstancedWEBGL(n,c,0,u,0,h,0,d);let _=0;for(let y=0;y<d;y++)_+=u[y]*h[y];e.update(_,n,1)}}this.setMode=s,this.render=r,this.renderInstances=a,this.renderMultiDraw=o,this.renderMultiDrawInstances=l}function Om(i,t,e,n){let s;function r(){if(s!==void 0)return s;if(t.has("EXT_texture_filter_anisotropic")===!0){let C=t.get("EXT_texture_filter_anisotropic");s=i.getParameter(C.MAX_TEXTURE_MAX_ANISOTROPY_EXT)}else s=0;return s}function a(C){return!(C!==on&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_FORMAT))}function o(C){let B=C===hs&&(t.has("EXT_color_buffer_half_float")||t.has("EXT_color_buffer_float"));return!(C!==xn&&n.convert(C)!==i.getParameter(i.IMPLEMENTATION_COLOR_READ_TYPE)&&C!==yn&&!B)}function l(C){if(C==="highp"){if(i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.HIGH_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.HIGH_FLOAT).precision>0)return"highp";C="mediump"}return C==="mediump"&&i.getShaderPrecisionFormat(i.VERTEX_SHADER,i.MEDIUM_FLOAT).precision>0&&i.getShaderPrecisionFormat(i.FRAGMENT_SHADER,i.MEDIUM_FLOAT).precision>0?"mediump":"lowp"}let c=e.precision!==void 0?e.precision:"highp",u=l(c);u!==c&&(console.warn("THREE.WebGLRenderer:",c,"not supported, using",u,"instead."),c=u);let d=e.logarithmicDepthBuffer===!0,h=e.reversedDepthBuffer===!0&&t.has("EXT_clip_control"),f=i.getParameter(i.MAX_TEXTURE_IMAGE_UNITS),_=i.getParameter(i.MAX_VERTEX_TEXTURE_IMAGE_UNITS),y=i.getParameter(i.MAX_TEXTURE_SIZE),m=i.getParameter(i.MAX_CUBE_MAP_TEXTURE_SIZE),p=i.getParameter(i.MAX_VERTEX_ATTRIBS),w=i.getParameter(i.MAX_VERTEX_UNIFORM_VECTORS),E=i.getParameter(i.MAX_VARYING_VECTORS),M=i.getParameter(i.MAX_FRAGMENT_UNIFORM_VECTORS),P=_>0,R=i.getParameter(i.MAX_SAMPLES);return{isWebGL2:!0,getMaxAnisotropy:r,getMaxPrecision:l,textureFormatReadable:a,textureTypeReadable:o,precision:c,logarithmicDepthBuffer:d,reversedDepthBuffer:h,maxTextures:f,maxVertexTextures:_,maxTextureSize:y,maxCubemapSize:m,maxAttributes:p,maxVertexUniforms:w,maxVaryings:E,maxFragmentUniforms:M,vertexTextures:P,maxSamples:R}}function Bm(i){let t=this,e=null,n=0,s=!1,r=!1,a=new an,o=new Ot,l={value:null,needsUpdate:!1};this.uniform=l,this.numPlanes=0,this.numIntersection=0,this.init=function(d,h){let f=d.length!==0||h||n!==0||s;return s=h,n=d.length,f},this.beginShadows=function(){r=!0,u(null)},this.endShadows=function(){r=!1},this.setGlobalState=function(d,h){e=u(d,h,0)},this.setState=function(d,h,f){let _=d.clippingPlanes,y=d.clipIntersection,m=d.clipShadows,p=i.get(d);if(!s||_===null||_.length===0||r&&!m)r?u(null):c();else{let w=r?0:n,E=w*4,M=p.clippingState||null;l.value=M,M=u(_,h,E,f);for(let P=0;P!==E;++P)M[P]=e[P];p.clippingState=M,this.numIntersection=y?this.numPlanes:0,this.numPlanes+=w}};function c(){l.value!==e&&(l.value=e,l.needsUpdate=n>0),t.numPlanes=n,t.numIntersection=0}function u(d,h,f,_){let y=d!==null?d.length:0,m=null;if(y!==0){if(m=l.value,_!==!0||m===null){let p=f+y*4,w=h.matrixWorldInverse;o.getNormalMatrix(w),(m===null||m.length<p)&&(m=new Float32Array(p));for(let E=0,M=f;E!==y;++E,M+=4)a.copy(d[E]).applyMatrix4(w,o),a.normal.toArray(m,M),m[M+3]=a.constant}l.value=m,l.needsUpdate=!0}return t.numPlanes=y,t.numIntersection=0,m}}function zm(i){let t=new WeakMap;function e(a,o){return o===Ta?a.mapping=Ai:o===Aa&&(a.mapping=Ci),a}function n(a){if(a&&a.isTexture){let o=a.mapping;if(o===Ta||o===Aa)if(t.has(a)){let l=t.get(a).texture;return e(l,a.mapping)}else{let l=a.image;if(l&&l.height>0){let c=new Qr(l.height);return c.fromEquirectangularTexture(i,a),t.set(a,c),a.addEventListener("dispose",s),e(c.texture,a.mapping)}else return null}}return a}function s(a){let o=a.target;o.removeEventListener("dispose",s);let l=t.get(o);l!==void 0&&(t.delete(o),l.dispose())}function r(){t=new WeakMap}return{get:n,dispose:r}}var ms=4,Jh=[.125,.215,.35,.446,.526,.582],Di=20,zl=new Qs,Kh=new kt,kl=null,Vl=0,Hl=0,Gl=!1,Li=(1+Math.sqrt(5))/2,fs=1/Li,jh=[new L(-Li,fs,0),new L(Li,fs,0),new L(-fs,0,Li),new L(fs,0,Li),new L(0,Li,-fs),new L(0,Li,fs),new L(-1,1,-1),new L(1,1,-1),new L(-1,1,1),new L(1,1,1)],km=new L,fo=class{constructor(t){this._renderer=t,this._pingPongRenderTarget=null,this._lodMax=0,this._cubeSize=0,this._lodPlanes=[],this._sizeLods=[],this._sigmas=[],this._blurMaterial=null,this._cubemapMaterial=null,this._equirectMaterial=null,this._compileMaterial(this._blurMaterial)}fromScene(t,e=0,n=.1,s=100,r={}){let{size:a=256,position:o=km}=r;kl=this._renderer.getRenderTarget(),Vl=this._renderer.getActiveCubeFace(),Hl=this._renderer.getActiveMipmapLevel(),Gl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1,this._setSize(a);let l=this._allocateTargets();return l.depthBuffer=!0,this._sceneToCubeUV(t,n,s,l,o),e>0&&this._blur(l,0,0,e),this._applyPMREM(l),this._cleanup(l),l}fromEquirectangular(t,e=null){return this._fromTexture(t,e)}fromCubemap(t,e=null){return this._fromTexture(t,e)}compileCubemapShader(){this._cubemapMaterial===null&&(this._cubemapMaterial=ed(),this._compileMaterial(this._cubemapMaterial))}compileEquirectangularShader(){this._equirectMaterial===null&&(this._equirectMaterial=td(),this._compileMaterial(this._equirectMaterial))}dispose(){this._dispose(),this._cubemapMaterial!==null&&this._cubemapMaterial.dispose(),this._equirectMaterial!==null&&this._equirectMaterial.dispose()}_setSize(t){this._lodMax=Math.floor(Math.log2(t)),this._cubeSize=Math.pow(2,this._lodMax)}_dispose(){this._blurMaterial!==null&&this._blurMaterial.dispose(),this._pingPongRenderTarget!==null&&this._pingPongRenderTarget.dispose();for(let t=0;t<this._lodPlanes.length;t++)this._lodPlanes[t].dispose()}_cleanup(t){this._renderer.setRenderTarget(kl,Vl,Hl),this._renderer.xr.enabled=Gl,t.scissorTest=!1,uo(t,0,0,t.width,t.height)}_fromTexture(t,e){t.mapping===Ai||t.mapping===Ci?this._setSize(t.image.length===0?16:t.image[0].width||t.image[0].image.width):this._setSize(t.image.width/4),kl=this._renderer.getRenderTarget(),Vl=this._renderer.getActiveCubeFace(),Hl=this._renderer.getActiveMipmapLevel(),Gl=this._renderer.xr.enabled,this._renderer.xr.enabled=!1;let n=e||this._allocateTargets();return this._textureToCubeUV(t,n),this._applyPMREM(n),this._cleanup(n),n}_allocateTargets(){let t=3*Math.max(this._cubeSize,112),e=4*this._cubeSize,n={magFilter:mn,minFilter:mn,generateMipmaps:!1,type:hs,format:on,colorSpace:Mi,depthBuffer:!1},s=Qh(t,e,n);if(this._pingPongRenderTarget===null||this._pingPongRenderTarget.width!==t||this._pingPongRenderTarget.height!==e){this._pingPongRenderTarget!==null&&this._dispose(),this._pingPongRenderTarget=Qh(t,e,n);let{_lodMax:r}=this;({sizeLods:this._sizeLods,lodPlanes:this._lodPlanes,sigmas:this._sigmas}=Vm(r)),this._blurMaterial=Hm(r,t,e)}return s}_compileMaterial(t){let e=new Te(this._lodPlanes[0],t);this._renderer.compile(e,zl)}_sceneToCubeUV(t,e,n,s,r){let l=new Ne(90,1,e,n),c=[1,-1,1,1,1,1],u=[1,1,1,-1,-1,-1],d=this._renderer,h=d.autoClear,f=d.toneMapping;d.getClearColor(Kh),d.toneMapping=Hn,d.autoClear=!1,d.state.buffers.depth.getReversed()&&(d.setRenderTarget(s),d.clearDepth(),d.setRenderTarget(null));let y=new Si({name:"PMREM.Background",side:ke,depthWrite:!1,depthTest:!1}),m=new Te(new rs,y),p=!1,w=t.background;w?w.isColor&&(y.color.copy(w),t.background=null,p=!0):(y.color.copy(Kh),p=!0);for(let E=0;E<6;E++){let M=E%3;M===0?(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x+u[E],r.y,r.z)):M===1?(l.up.set(0,0,c[E]),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y+u[E],r.z)):(l.up.set(0,c[E],0),l.position.set(r.x,r.y,r.z),l.lookAt(r.x,r.y,r.z+u[E]));let P=this._cubeSize;uo(s,M*P,E>2?P:0,P,P),d.setRenderTarget(s),p&&d.render(m,l),d.render(t,l)}m.geometry.dispose(),m.material.dispose(),d.toneMapping=f,d.autoClear=h,t.background=w}_textureToCubeUV(t,e){let n=this._renderer,s=t.mapping===Ai||t.mapping===Ci;s?(this._cubemapMaterial===null&&(this._cubemapMaterial=ed()),this._cubemapMaterial.uniforms.flipEnvMap.value=t.isRenderTargetTexture===!1?-1:1):this._equirectMaterial===null&&(this._equirectMaterial=td());let r=s?this._cubemapMaterial:this._equirectMaterial,a=new Te(this._lodPlanes[0],r),o=r.uniforms;o.envMap.value=t;let l=this._cubeSize;uo(e,0,0,3*l,2*l),n.setRenderTarget(e),n.render(a,zl)}_applyPMREM(t){let e=this._renderer,n=e.autoClear;e.autoClear=!1;let s=this._lodPlanes.length;for(let r=1;r<s;r++){let a=Math.sqrt(this._sigmas[r]*this._sigmas[r]-this._sigmas[r-1]*this._sigmas[r-1]),o=jh[(s-r-1)%jh.length];this._blur(t,r-1,r,a,o)}e.autoClear=n}_blur(t,e,n,s,r){let a=this._pingPongRenderTarget;this._halfBlur(t,a,e,n,s,"latitudinal",r),this._halfBlur(a,t,n,n,s,"longitudinal",r)}_halfBlur(t,e,n,s,r,a,o){let l=this._renderer,c=this._blurMaterial;a!=="latitudinal"&&a!=="longitudinal"&&console.error("blur direction must be either latitudinal or longitudinal!");let u=3,d=new Te(this._lodPlanes[s],c),h=c.uniforms,f=this._sizeLods[n]-1,_=isFinite(r)?Math.PI/(2*f):2*Math.PI/(2*Di-1),y=r/_,m=isFinite(r)?1+Math.floor(u*y):Di;m>Di&&console.warn(`sigmaRadians, ${r}, is too large and will clip, as it requested ${m} samples when the maximum is set to ${Di}`);let p=[],w=0;for(let C=0;C<Di;++C){let B=C/y,b=Math.exp(-B*B/2);p.push(b),C===0?w+=b:C<m&&(w+=2*b)}for(let C=0;C<p.length;C++)p[C]=p[C]/w;h.envMap.value=t.texture,h.samples.value=m,h.weights.value=p,h.latitudinal.value=a==="latitudinal",o&&(h.poleAxis.value=o);let{_lodMax:E}=this;h.dTheta.value=_,h.mipInt.value=E-n;let M=this._sizeLods[s],P=3*M*(s>E-ms?s-E+ms:0),R=4*(this._cubeSize-M);uo(e,P,R,3*M,2*M),l.setRenderTarget(e),l.render(d,zl)}};function Vm(i){let t=[],e=[],n=[],s=i,r=i-ms+1+Jh.length;for(let a=0;a<r;a++){let o=Math.pow(2,s);e.push(o);let l=1/o;a>i-ms?l=Jh[a-i+ms-1]:a===0&&(l=0),n.push(l);let c=1/(o-2),u=-c,d=1+c,h=[u,u,d,u,d,d,u,u,d,d,u,d],f=6,_=6,y=3,m=2,p=1,w=new Float32Array(y*_*f),E=new Float32Array(m*_*f),M=new Float32Array(p*_*f);for(let R=0;R<f;R++){let C=R%3*2/3-1,B=R>2?0:-1,b=[C,B,0,C+2/3,B,0,C+2/3,B+1,0,C,B,0,C+2/3,B+1,0,C,B+1,0];w.set(b,y*_*R),E.set(h,m*_*R);let v=[R,R,R,R,R,R];M.set(v,p*_*R)}let P=new $e;P.setAttribute("position",new we(w,y)),P.setAttribute("uv",new we(E,m)),P.setAttribute("faceIndex",new we(M,p)),t.push(P),s>ms&&s--}return{lodPlanes:t,sizeLods:e,sigmas:n}}function Qh(i,t,e){let n=new En(i,t,e);return n.texture.mapping=ir,n.texture.name="PMREM.cubeUv",n.scissorTest=!0,n}function uo(i,t,e,n,s){i.viewport.set(t,e,n,s),i.scissor.set(t,e,n,s)}function Hm(i,t,e){let n=new Float32Array(Di),s=new L(0,1,0);return new _n({name:"SphericalGaussianBlur",defines:{n:Di,CUBEUV_TEXEL_WIDTH:1/t,CUBEUV_TEXEL_HEIGHT:1/e,CUBEUV_MAX_MIP:`${i}.0`},uniforms:{envMap:{value:null},samples:{value:1},weights:{value:n},latitudinal:{value:!1},dTheta:{value:0},mipInt:{value:0},poleAxis:{value:s}},vertexShader:Ql(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;
			uniform int samples;
			uniform float weights[ n ];
			uniform bool latitudinal;
			uniform float dTheta;
			uniform float mipInt;
			uniform vec3 poleAxis;

			#define ENVMAP_TYPE_CUBE_UV
			#include <cube_uv_reflection_fragment>

			vec3 getSample( float theta, vec3 axis ) {

				float cosTheta = cos( theta );
				// Rodrigues' axis-angle rotation
				vec3 sampleDirection = vOutputDirection * cosTheta
					+ cross( axis, vOutputDirection ) * sin( theta )
					+ axis * dot( axis, vOutputDirection ) * ( 1.0 - cosTheta );

				return bilinearCubeUV( envMap, sampleDirection, mipInt );

			}

			void main() {

				vec3 axis = latitudinal ? poleAxis : cross( poleAxis, vOutputDirection );

				if ( all( equal( axis, vec3( 0.0 ) ) ) ) {

					axis = vec3( vOutputDirection.z, 0.0, - vOutputDirection.x );

				}

				axis = normalize( axis );

				gl_FragColor = vec4( 0.0, 0.0, 0.0, 1.0 );
				gl_FragColor.rgb += weights[ 0 ] * getSample( 0.0, axis );

				for ( int i = 1; i < n; i++ ) {

					if ( i >= samples ) {

						break;

					}

					float theta = dTheta * float( i );
					gl_FragColor.rgb += weights[ i ] * getSample( -1.0 * theta, axis );
					gl_FragColor.rgb += weights[ i ] * getSample( theta, axis );

				}

			}
		`,blending:Vn,depthTest:!1,depthWrite:!1})}function td(){return new _n({name:"EquirectangularToCubeUV",uniforms:{envMap:{value:null}},vertexShader:Ql(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			varying vec3 vOutputDirection;

			uniform sampler2D envMap;

			#include <common>

			void main() {

				vec3 outputDirection = normalize( vOutputDirection );
				vec2 uv = equirectUv( outputDirection );

				gl_FragColor = vec4( texture2D ( envMap, uv ).rgb, 1.0 );

			}
		`,blending:Vn,depthTest:!1,depthWrite:!1})}function ed(){return new _n({name:"CubemapToCubeUV",uniforms:{envMap:{value:null},flipEnvMap:{value:-1}},vertexShader:Ql(),fragmentShader:`

			precision mediump float;
			precision mediump int;

			uniform float flipEnvMap;

			varying vec3 vOutputDirection;

			uniform samplerCube envMap;

			void main() {

				gl_FragColor = textureCube( envMap, vec3( flipEnvMap * vOutputDirection.x, vOutputDirection.yz ) );

			}
		`,blending:Vn,depthTest:!1,depthWrite:!1})}function Ql(){return`

		precision mediump float;
		precision mediump int;

		attribute float faceIndex;

		varying vec3 vOutputDirection;

		// RH coordinate system; PMREM face-indexing convention
		vec3 getDirection( vec2 uv, float face ) {

			uv = 2.0 * uv - 1.0;

			vec3 direction = vec3( uv, 1.0 );

			if ( face == 0.0 ) {

				direction = direction.zyx; // ( 1, v, u ) pos x

			} else if ( face == 1.0 ) {

				direction = direction.xzy;
				direction.xz *= -1.0; // ( -u, 1, -v ) pos y

			} else if ( face == 2.0 ) {

				direction.x *= -1.0; // ( -u, v, 1 ) pos z

			} else if ( face == 3.0 ) {

				direction = direction.zyx;
				direction.xz *= -1.0; // ( -1, v, -u ) neg x

			} else if ( face == 4.0 ) {

				direction = direction.xzy;
				direction.xy *= -1.0; // ( -u, -1, v ) neg y

			} else if ( face == 5.0 ) {

				direction.z *= -1.0; // ( u, v, -1 ) neg z

			}

			return direction;

		}

		void main() {

			vOutputDirection = getDirection( uv, faceIndex );
			gl_Position = vec4( position, 1.0 );

		}
	`}function Gm(i){let t=new WeakMap,e=null;function n(o){if(o&&o.isTexture){let l=o.mapping,c=l===Ta||l===Aa,u=l===Ai||l===Ci;if(c||u){let d=t.get(o),h=d!==void 0?d.texture.pmremVersion:0;if(o.isRenderTargetTexture&&o.pmremVersion!==h)return e===null&&(e=new fo(i)),d=c?e.fromEquirectangular(o,d):e.fromCubemap(o,d),d.texture.pmremVersion=o.pmremVersion,t.set(o,d),d.texture;if(d!==void 0)return d.texture;{let f=o.image;return c&&f&&f.height>0||u&&f&&s(f)?(e===null&&(e=new fo(i)),d=c?e.fromEquirectangular(o):e.fromCubemap(o),d.texture.pmremVersion=o.pmremVersion,t.set(o,d),o.addEventListener("dispose",r),d.texture):null}}}return o}function s(o){let l=0,c=6;for(let u=0;u<c;u++)o[u]!==void 0&&l++;return l===c}function r(o){let l=o.target;l.removeEventListener("dispose",r);let c=t.get(l);c!==void 0&&(t.delete(l),c.dispose())}function a(){t=new WeakMap,e!==null&&(e.dispose(),e=null)}return{get:n,dispose:a}}function Wm(i){let t={};function e(n){if(t[n]!==void 0)return t[n];let s;switch(n){case"WEBGL_depth_texture":s=i.getExtension("WEBGL_depth_texture")||i.getExtension("MOZ_WEBGL_depth_texture")||i.getExtension("WEBKIT_WEBGL_depth_texture");break;case"EXT_texture_filter_anisotropic":s=i.getExtension("EXT_texture_filter_anisotropic")||i.getExtension("MOZ_EXT_texture_filter_anisotropic")||i.getExtension("WEBKIT_EXT_texture_filter_anisotropic");break;case"WEBGL_compressed_texture_s3tc":s=i.getExtension("WEBGL_compressed_texture_s3tc")||i.getExtension("MOZ_WEBGL_compressed_texture_s3tc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_s3tc");break;case"WEBGL_compressed_texture_pvrtc":s=i.getExtension("WEBGL_compressed_texture_pvrtc")||i.getExtension("WEBKIT_WEBGL_compressed_texture_pvrtc");break;default:s=i.getExtension(n)}return t[n]=s,s}return{has:function(n){return e(n)!==null},init:function(){e("EXT_color_buffer_float"),e("WEBGL_clip_cull_distance"),e("OES_texture_float_linear"),e("EXT_color_buffer_half_float"),e("WEBGL_multisampled_render_to_texture"),e("WEBGL_render_shared_exponent")},get:function(n){let s=e(n);return s===null&&ns("THREE.WebGLRenderer: "+n+" extension not supported."),s}}}function Xm(i,t,e,n){let s={},r=new WeakMap;function a(d){let h=d.target;h.index!==null&&t.remove(h.index);for(let _ in h.attributes)t.remove(h.attributes[_]);h.removeEventListener("dispose",a),delete s[h.id];let f=r.get(h);f&&(t.remove(f),r.delete(h)),n.releaseStatesOfGeometry(h),h.isInstancedBufferGeometry===!0&&delete h._maxInstanceCount,e.memory.geometries--}function o(d,h){return s[h.id]===!0||(h.addEventListener("dispose",a),s[h.id]=!0,e.memory.geometries++),h}function l(d){let h=d.attributes;for(let f in h)t.update(h[f],i.ARRAY_BUFFER)}function c(d){let h=[],f=d.index,_=d.attributes.position,y=0;if(f!==null){let w=f.array;y=f.version;for(let E=0,M=w.length;E<M;E+=3){let P=w[E+0],R=w[E+1],C=w[E+2];h.push(P,R,R,C,C,P)}}else if(_!==void 0){let w=_.array;y=_.version;for(let E=0,M=w.length/3-1;E<M;E+=3){let P=E+0,R=E+1,C=E+2;h.push(P,R,R,C,C,P)}}else return;let m=new(Nl(h)?Vs:ks)(h,1);m.version=y;let p=r.get(d);p&&t.remove(p),r.set(d,m)}function u(d){let h=r.get(d);if(h){let f=d.index;f!==null&&h.version<f.version&&c(d)}else c(d);return r.get(d)}return{get:o,update:l,getWireframeAttribute:u}}function $m(i,t,e){let n;function s(h){n=h}let r,a;function o(h){r=h.type,a=h.bytesPerElement}function l(h,f){i.drawElements(n,f,r,h*a),e.update(f,n,1)}function c(h,f,_){_!==0&&(i.drawElementsInstanced(n,f,r,h*a,_),e.update(f,n,_))}function u(h,f,_){if(_===0)return;t.get("WEBGL_multi_draw").multiDrawElementsWEBGL(n,f,0,r,h,0,_);let m=0;for(let p=0;p<_;p++)m+=f[p];e.update(m,n,1)}function d(h,f,_,y){if(_===0)return;let m=t.get("WEBGL_multi_draw");if(m===null)for(let p=0;p<h.length;p++)c(h[p]/a,f[p],y[p]);else{m.multiDrawElementsInstancedWEBGL(n,f,0,r,h,0,y,0,_);let p=0;for(let w=0;w<_;w++)p+=f[w]*y[w];e.update(p,n,1)}}this.setMode=s,this.setIndex=o,this.render=l,this.renderInstances=c,this.renderMultiDraw=u,this.renderMultiDrawInstances=d}function qm(i){let t={geometries:0,textures:0},e={frame:0,calls:0,triangles:0,points:0,lines:0};function n(r,a,o){switch(e.calls++,a){case i.TRIANGLES:e.triangles+=o*(r/3);break;case i.LINES:e.lines+=o*(r/2);break;case i.LINE_STRIP:e.lines+=o*(r-1);break;case i.LINE_LOOP:e.lines+=o*r;break;case i.POINTS:e.points+=o*r;break;default:console.error("THREE.WebGLInfo: Unknown draw mode:",a);break}}function s(){e.calls=0,e.triangles=0,e.points=0,e.lines=0}return{memory:t,render:e,programs:null,autoReset:!0,reset:s,update:n}}function Ym(i,t,e){let n=new WeakMap,s=new de;function r(a,o,l){let c=a.morphTargetInfluences,u=o.morphAttributes.position||o.morphAttributes.normal||o.morphAttributes.color,d=u!==void 0?u.length:0,h=n.get(o);if(h===void 0||h.count!==d){let b=function(){C.dispose(),n.delete(o),o.removeEventListener("dispose",b)};h!==void 0&&h.texture.dispose();let f=o.morphAttributes.position!==void 0,_=o.morphAttributes.normal!==void 0,y=o.morphAttributes.color!==void 0,m=o.morphAttributes.position||[],p=o.morphAttributes.normal||[],w=o.morphAttributes.color||[],E=0;f===!0&&(E=1),_===!0&&(E=2),y===!0&&(E=3);let M=o.attributes.position.count*E,P=1;M>t.maxTextureSize&&(P=Math.ceil(M/t.maxTextureSize),M=t.maxTextureSize);let R=new Float32Array(M*P*4*d),C=new zs(R,M,P,d);C.type=yn,C.needsUpdate=!0;let B=E*4;for(let v=0;v<d;v++){let D=m[v],V=p[v],W=w[v],q=M*P*4*v;for(let J=0;J<D.count;J++){let $=J*B;f===!0&&(s.fromBufferAttribute(D,J),R[q+$+0]=s.x,R[q+$+1]=s.y,R[q+$+2]=s.z,R[q+$+3]=0),_===!0&&(s.fromBufferAttribute(V,J),R[q+$+4]=s.x,R[q+$+5]=s.y,R[q+$+6]=s.z,R[q+$+7]=0),y===!0&&(s.fromBufferAttribute(W,J),R[q+$+8]=s.x,R[q+$+9]=s.y,R[q+$+10]=s.z,R[q+$+11]=W.itemSize===4?s.w:1)}}h={count:d,texture:C,size:new Dt(M,P)},n.set(o,h),o.addEventListener("dispose",b)}if(a.isInstancedMesh===!0&&a.morphTexture!==null)l.getUniforms().setValue(i,"morphTexture",a.morphTexture,e);else{let f=0;for(let y=0;y<c.length;y++)f+=c[y];let _=o.morphTargetsRelative?1:1-f;l.getUniforms().setValue(i,"morphTargetBaseInfluence",_),l.getUniforms().setValue(i,"morphTargetInfluences",c)}l.getUniforms().setValue(i,"morphTargetsTexture",h.texture,e),l.getUniforms().setValue(i,"morphTargetsTextureSize",h.size)}return{update:r}}function Zm(i,t,e,n){let s=new WeakMap;function r(l){let c=n.render.frame,u=l.geometry,d=t.get(l,u);if(s.get(d)!==c&&(t.update(d),s.set(d,c)),l.isInstancedMesh&&(l.hasEventListener("dispose",o)===!1&&l.addEventListener("dispose",o),s.get(l)!==c&&(e.update(l.instanceMatrix,i.ARRAY_BUFFER),l.instanceColor!==null&&e.update(l.instanceColor,i.ARRAY_BUFFER),s.set(l,c))),l.isSkinnedMesh){let h=l.skeleton;s.get(h)!==c&&(h.update(),s.set(h,c))}return d}function a(){s=new WeakMap}function o(l){let c=l.target;c.removeEventListener("dispose",o),e.remove(c.instanceMatrix),c.instanceColor!==null&&e.remove(c.instanceColor)}return{update:r,dispose:a}}var vd=new Xe,nd=new Ys(1,1),bd=new zs,Md=new Kr,Sd=new Gs,id=[],sd=[],rd=new Float32Array(16),ad=new Float32Array(9),od=new Float32Array(4);function _s(i,t,e){let n=i[0];if(n<=0||n>0)return i;let s=t*e,r=id[s];if(r===void 0&&(r=new Float32Array(s),id[s]=r),t!==0){n.toArray(r,0);for(let a=1,o=0;a!==t;++a)o+=e,i[a].toArray(r,o)}return r}function _e(i,t){if(i.length!==t.length)return!1;for(let e=0,n=i.length;e<n;e++)if(i[e]!==t[e])return!1;return!0}function xe(i,t){for(let e=0,n=t.length;e<n;e++)i[e]=t[e]}function go(i,t){let e=sd[t];e===void 0&&(e=new Int32Array(t),sd[t]=e);for(let n=0;n!==t;++n)e[n]=i.allocateTextureUnit();return e}function Jm(i,t){let e=this.cache;e[0]!==t&&(i.uniform1f(this.addr,t),e[0]=t)}function Km(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2f(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_e(e,t))return;i.uniform2fv(this.addr,t),xe(e,t)}}function jm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3f(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else if(t.r!==void 0)(e[0]!==t.r||e[1]!==t.g||e[2]!==t.b)&&(i.uniform3f(this.addr,t.r,t.g,t.b),e[0]=t.r,e[1]=t.g,e[2]=t.b);else{if(_e(e,t))return;i.uniform3fv(this.addr,t),xe(e,t)}}function Qm(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4f(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_e(e,t))return;i.uniform4fv(this.addr,t),xe(e,t)}}function tg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(_e(e,t))return;i.uniformMatrix2fv(this.addr,!1,t),xe(e,t)}else{if(_e(e,n))return;od.set(n),i.uniformMatrix2fv(this.addr,!1,od),xe(e,n)}}function eg(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(_e(e,t))return;i.uniformMatrix3fv(this.addr,!1,t),xe(e,t)}else{if(_e(e,n))return;ad.set(n),i.uniformMatrix3fv(this.addr,!1,ad),xe(e,n)}}function ng(i,t){let e=this.cache,n=t.elements;if(n===void 0){if(_e(e,t))return;i.uniformMatrix4fv(this.addr,!1,t),xe(e,t)}else{if(_e(e,n))return;rd.set(n),i.uniformMatrix4fv(this.addr,!1,rd),xe(e,n)}}function ig(i,t){let e=this.cache;e[0]!==t&&(i.uniform1i(this.addr,t),e[0]=t)}function sg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2i(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_e(e,t))return;i.uniform2iv(this.addr,t),xe(e,t)}}function rg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3i(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_e(e,t))return;i.uniform3iv(this.addr,t),xe(e,t)}}function ag(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4i(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_e(e,t))return;i.uniform4iv(this.addr,t),xe(e,t)}}function og(i,t){let e=this.cache;e[0]!==t&&(i.uniform1ui(this.addr,t),e[0]=t)}function lg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y)&&(i.uniform2ui(this.addr,t.x,t.y),e[0]=t.x,e[1]=t.y);else{if(_e(e,t))return;i.uniform2uiv(this.addr,t),xe(e,t)}}function cg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z)&&(i.uniform3ui(this.addr,t.x,t.y,t.z),e[0]=t.x,e[1]=t.y,e[2]=t.z);else{if(_e(e,t))return;i.uniform3uiv(this.addr,t),xe(e,t)}}function hg(i,t){let e=this.cache;if(t.x!==void 0)(e[0]!==t.x||e[1]!==t.y||e[2]!==t.z||e[3]!==t.w)&&(i.uniform4ui(this.addr,t.x,t.y,t.z,t.w),e[0]=t.x,e[1]=t.y,e[2]=t.z,e[3]=t.w);else{if(_e(e,t))return;i.uniform4uiv(this.addr,t),xe(e,t)}}function dg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s);let r;this.type===i.SAMPLER_2D_SHADOW?(nd.compareFunction=Pl,r=nd):r=vd,e.setTexture2D(t||r,s)}function ug(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture3D(t||Md,s)}function pg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTextureCube(t||Sd,s)}function fg(i,t,e){let n=this.cache,s=e.allocateTextureUnit();n[0]!==s&&(i.uniform1i(this.addr,s),n[0]=s),e.setTexture2DArray(t||bd,s)}function mg(i){switch(i){case 5126:return Jm;case 35664:return Km;case 35665:return jm;case 35666:return Qm;case 35674:return tg;case 35675:return eg;case 35676:return ng;case 5124:case 35670:return ig;case 35667:case 35671:return sg;case 35668:case 35672:return rg;case 35669:case 35673:return ag;case 5125:return og;case 36294:return lg;case 36295:return cg;case 36296:return hg;case 35678:case 36198:case 36298:case 36306:case 35682:return dg;case 35679:case 36299:case 36307:return ug;case 35680:case 36300:case 36308:case 36293:return pg;case 36289:case 36303:case 36311:case 36292:return fg}}function gg(i,t){i.uniform1fv(this.addr,t)}function _g(i,t){let e=_s(t,this.size,2);i.uniform2fv(this.addr,e)}function xg(i,t){let e=_s(t,this.size,3);i.uniform3fv(this.addr,e)}function yg(i,t){let e=_s(t,this.size,4);i.uniform4fv(this.addr,e)}function vg(i,t){let e=_s(t,this.size,4);i.uniformMatrix2fv(this.addr,!1,e)}function bg(i,t){let e=_s(t,this.size,9);i.uniformMatrix3fv(this.addr,!1,e)}function Mg(i,t){let e=_s(t,this.size,16);i.uniformMatrix4fv(this.addr,!1,e)}function Sg(i,t){i.uniform1iv(this.addr,t)}function wg(i,t){i.uniform2iv(this.addr,t)}function Eg(i,t){i.uniform3iv(this.addr,t)}function Tg(i,t){i.uniform4iv(this.addr,t)}function Ag(i,t){i.uniform1uiv(this.addr,t)}function Cg(i,t){i.uniform2uiv(this.addr,t)}function Rg(i,t){i.uniform3uiv(this.addr,t)}function Pg(i,t){i.uniform4uiv(this.addr,t)}function Ig(i,t,e){let n=this.cache,s=t.length,r=go(e,s);_e(n,r)||(i.uniform1iv(this.addr,r),xe(n,r));for(let a=0;a!==s;++a)e.setTexture2D(t[a]||vd,r[a])}function Lg(i,t,e){let n=this.cache,s=t.length,r=go(e,s);_e(n,r)||(i.uniform1iv(this.addr,r),xe(n,r));for(let a=0;a!==s;++a)e.setTexture3D(t[a]||Md,r[a])}function Dg(i,t,e){let n=this.cache,s=t.length,r=go(e,s);_e(n,r)||(i.uniform1iv(this.addr,r),xe(n,r));for(let a=0;a!==s;++a)e.setTextureCube(t[a]||Sd,r[a])}function Ng(i,t,e){let n=this.cache,s=t.length,r=go(e,s);_e(n,r)||(i.uniform1iv(this.addr,r),xe(n,r));for(let a=0;a!==s;++a)e.setTexture2DArray(t[a]||bd,r[a])}function Ug(i){switch(i){case 5126:return gg;case 35664:return _g;case 35665:return xg;case 35666:return yg;case 35674:return vg;case 35675:return bg;case 35676:return Mg;case 5124:case 35670:return Sg;case 35667:case 35671:return wg;case 35668:case 35672:return Eg;case 35669:case 35673:return Tg;case 5125:return Ag;case 36294:return Cg;case 36295:return Rg;case 36296:return Pg;case 35678:case 36198:case 36298:case 36306:case 35682:return Ig;case 35679:case 36299:case 36307:return Lg;case 35680:case 36300:case 36308:case 36293:return Dg;case 36289:case 36303:case 36311:case 36292:return Ng}}var Xl=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.setValue=mg(e.type)}},$l=class{constructor(t,e,n){this.id=t,this.addr=n,this.cache=[],this.type=e.type,this.size=e.size,this.setValue=Ug(e.type)}},ql=class{constructor(t){this.id=t,this.seq=[],this.map={}}setValue(t,e,n){let s=this.seq;for(let r=0,a=s.length;r!==a;++r){let o=s[r];o.setValue(t,e[o.id],n)}}},Wl=/(\w+)(\])?(\[|\.)?/g;function ld(i,t){i.seq.push(t),i.map[t.id]=t}function Fg(i,t,e){let n=i.name,s=n.length;for(Wl.lastIndex=0;;){let r=Wl.exec(n),a=Wl.lastIndex,o=r[1],l=r[2]==="]",c=r[3];if(l&&(o=o|0),c===void 0||c==="["&&a+2===s){ld(e,c===void 0?new Xl(o,i,t):new $l(o,i,t));break}else{let d=e.map[o];d===void 0&&(d=new ql(o),ld(e,d)),e=d}}}var gs=class{constructor(t,e){this.seq=[],this.map={};let n=t.getProgramParameter(e,t.ACTIVE_UNIFORMS);for(let s=0;s<n;++s){let r=t.getActiveUniform(e,s),a=t.getUniformLocation(e,r.name);Fg(r,a,this)}}setValue(t,e,n,s){let r=this.map[e];r!==void 0&&r.setValue(t,n,s)}setOptional(t,e,n){let s=e[n];s!==void 0&&this.setValue(t,n,s)}static upload(t,e,n,s){for(let r=0,a=e.length;r!==a;++r){let o=e[r],l=n[o.id];l.needsUpdate!==!1&&o.setValue(t,l.value,s)}}static seqWithValue(t,e){let n=[];for(let s=0,r=t.length;s!==r;++s){let a=t[s];a.id in e&&n.push(a)}return n}};function cd(i,t,e){let n=i.createShader(t);return i.shaderSource(n,e),i.compileShader(n),n}var Og=37297,Bg=0;function zg(i,t){let e=i.split(`
`),n=[],s=Math.max(t-6,0),r=Math.min(t+6,e.length);for(let a=s;a<r;a++){let o=a+1;n.push(`${o===t?">":" "} ${o}: ${e[a]}`)}return n.join(`
`)}var hd=new Ot;function kg(i){$t._getMatrix(hd,$t.workingColorSpace,i);let t=`mat3( ${hd.elements.map(e=>e.toFixed(4))} )`;switch($t.getTransfer(i)){case Fs:return[t,"LinearTransferOETF"];case Kt:return[t,"sRGBTransferOETF"];default:return console.warn("THREE.WebGLProgram: Unsupported color space: ",i),[t,"LinearTransferOETF"]}}function dd(i,t,e){let n=i.getShaderParameter(t,i.COMPILE_STATUS),r=(i.getShaderInfoLog(t)||"").trim();if(n&&r==="")return"";let a=/ERROR: 0:(\d+)/.exec(r);if(a){let o=parseInt(a[1]);return e.toUpperCase()+`

`+r+`

`+zg(i.getShaderSource(t),o)}else return r}function Vg(i,t){let e=kg(t);return[`vec4 ${i}( vec4 value ) {`,`	return ${e[1]}( vec4( value.rgb * ${e[0]}, value.a ) );`,"}"].join(`
`)}function Hg(i,t){let e;switch(t){case Ch:e="Linear";break;case Rh:e="Reinhard";break;case Ph:e="Cineon";break;case Ea:e="ACESFilmic";break;case Lh:e="AgX";break;case Dh:e="Neutral";break;case Ih:e="Custom";break;default:console.warn("THREE.WebGLProgram: Unsupported toneMapping:",t),e="Linear"}return"vec3 "+i+"( vec3 color ) { return "+e+"ToneMapping( color ); }"}var po=new L;function Gg(){$t.getLuminanceCoefficients(po);let i=po.x.toFixed(4),t=po.y.toFixed(4),e=po.z.toFixed(4);return["float luminance( const in vec3 rgb ) {",`	const vec3 weights = vec3( ${i}, ${t}, ${e} );`,"	return dot( weights, rgb );","}"].join(`
`)}function Wg(i){return[i.extensionClipCullDistance?"#extension GL_ANGLE_clip_cull_distance : require":"",i.extensionMultiDraw?"#extension GL_ANGLE_multi_draw : require":""].filter(cr).join(`
`)}function Xg(i){let t=[];for(let e in i){let n=i[e];n!==!1&&t.push("#define "+e+" "+n)}return t.join(`
`)}function $g(i,t){let e={},n=i.getProgramParameter(t,i.ACTIVE_ATTRIBUTES);for(let s=0;s<n;s++){let r=i.getActiveAttrib(t,s),a=r.name,o=1;r.type===i.FLOAT_MAT2&&(o=2),r.type===i.FLOAT_MAT3&&(o=3),r.type===i.FLOAT_MAT4&&(o=4),e[a]={type:r.type,location:i.getAttribLocation(t,a),locationSize:o}}return e}function cr(i){return i!==""}function ud(i,t){let e=t.numSpotLightShadows+t.numSpotLightMaps-t.numSpotLightShadowsWithMaps;return i.replace(/NUM_DIR_LIGHTS/g,t.numDirLights).replace(/NUM_SPOT_LIGHTS/g,t.numSpotLights).replace(/NUM_SPOT_LIGHT_MAPS/g,t.numSpotLightMaps).replace(/NUM_SPOT_LIGHT_COORDS/g,e).replace(/NUM_RECT_AREA_LIGHTS/g,t.numRectAreaLights).replace(/NUM_POINT_LIGHTS/g,t.numPointLights).replace(/NUM_HEMI_LIGHTS/g,t.numHemiLights).replace(/NUM_DIR_LIGHT_SHADOWS/g,t.numDirLightShadows).replace(/NUM_SPOT_LIGHT_SHADOWS_WITH_MAPS/g,t.numSpotLightShadowsWithMaps).replace(/NUM_SPOT_LIGHT_SHADOWS/g,t.numSpotLightShadows).replace(/NUM_POINT_LIGHT_SHADOWS/g,t.numPointLightShadows)}function pd(i,t){return i.replace(/NUM_CLIPPING_PLANES/g,t.numClippingPlanes).replace(/UNION_CLIPPING_PLANES/g,t.numClippingPlanes-t.numClipIntersection)}var qg=/^[ \t]*#include +<([\w\d./]+)>/gm;function Yl(i){return i.replace(qg,Zg)}var Yg=new Map;function Zg(i,t){let e=Vt[t];if(e===void 0){let n=Yg.get(t);if(n!==void 0)e=Vt[n],console.warn('THREE.WebGLRenderer: Shader chunk "%s" has been deprecated. Use "%s" instead.',t,n);else throw new Error("Can not resolve #include <"+t+">")}return Yl(e)}var Jg=/#pragma unroll_loop_start\s+for\s*\(\s*int\s+i\s*=\s*(\d+)\s*;\s*i\s*<\s*(\d+)\s*;\s*i\s*\+\+\s*\)\s*{([\s\S]+?)}\s+#pragma unroll_loop_end/g;function fd(i){return i.replace(Jg,Kg)}function Kg(i,t,e,n){let s="";for(let r=parseInt(t);r<parseInt(e);r++)s+=n.replace(/\[\s*i\s*\]/g,"[ "+r+" ]").replace(/UNROLLED_LOOP_INDEX/g,r);return s}function md(i){let t=`precision ${i.precision} float;
	precision ${i.precision} int;
	precision ${i.precision} sampler2D;
	precision ${i.precision} samplerCube;
	precision ${i.precision} sampler3D;
	precision ${i.precision} sampler2DArray;
	precision ${i.precision} sampler2DShadow;
	precision ${i.precision} samplerCubeShadow;
	precision ${i.precision} sampler2DArrayShadow;
	precision ${i.precision} isampler2D;
	precision ${i.precision} isampler3D;
	precision ${i.precision} isamplerCube;
	precision ${i.precision} isampler2DArray;
	precision ${i.precision} usampler2D;
	precision ${i.precision} usampler3D;
	precision ${i.precision} usamplerCube;
	precision ${i.precision} usampler2DArray;
	`;return i.precision==="highp"?t+=`
#define HIGH_PRECISION`:i.precision==="mediump"?t+=`
#define MEDIUM_PRECISION`:i.precision==="lowp"&&(t+=`
#define LOW_PRECISION`),t}function jg(i){let t="SHADOWMAP_TYPE_BASIC";return i.shadowMapType===gl?t="SHADOWMAP_TYPE_PCF":i.shadowMapType===_a?t="SHADOWMAP_TYPE_PCF_SOFT":i.shadowMapType===Tn&&(t="SHADOWMAP_TYPE_VSM"),t}function Qg(i){let t="ENVMAP_TYPE_CUBE";if(i.envMap)switch(i.envMapMode){case Ai:case Ci:t="ENVMAP_TYPE_CUBE";break;case ir:t="ENVMAP_TYPE_CUBE_UV";break}return t}function t_(i){let t="ENVMAP_MODE_REFLECTION";if(i.envMap)switch(i.envMapMode){case Ci:t="ENVMAP_MODE_REFRACTION";break}return t}function e_(i){let t="ENVMAP_BLENDING_NONE";if(i.envMap)switch(i.combine){case vl:t="ENVMAP_BLENDING_MULTIPLY";break;case Th:t="ENVMAP_BLENDING_MIX";break;case Ah:t="ENVMAP_BLENDING_ADD";break}return t}function n_(i){let t=i.envMapCubeUVHeight;if(t===null)return null;let e=Math.log2(t)-2,n=1/t;return{texelWidth:1/(3*Math.max(Math.pow(2,e),112)),texelHeight:n,maxMip:e}}function i_(i,t,e,n){let s=i.getContext(),r=e.defines,a=e.vertexShader,o=e.fragmentShader,l=jg(e),c=Qg(e),u=t_(e),d=e_(e),h=n_(e),f=Wg(e),_=Xg(r),y=s.createProgram(),m,p,w=e.glslVersion?"#version "+e.glslVersion+`
`:"";e.isRawShaderMaterial?(m=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(cr).join(`
`),m.length>0&&(m+=`
`),p=["#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_].filter(cr).join(`
`),p.length>0&&(p+=`
`)):(m=[md(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.extensionClipCullDistance?"#define USE_CLIP_DISTANCE":"",e.batching?"#define USE_BATCHING":"",e.batchingColor?"#define USE_BATCHING_COLOR":"",e.instancing?"#define USE_INSTANCING":"",e.instancingColor?"#define USE_INSTANCING_COLOR":"",e.instancingMorph?"#define USE_INSTANCING_MORPH":"",e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.map?"#define USE_MAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+u:"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.displacementMap?"#define USE_DISPLACEMENTMAP":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.mapUv?"#define MAP_UV "+e.mapUv:"",e.alphaMapUv?"#define ALPHAMAP_UV "+e.alphaMapUv:"",e.lightMapUv?"#define LIGHTMAP_UV "+e.lightMapUv:"",e.aoMapUv?"#define AOMAP_UV "+e.aoMapUv:"",e.emissiveMapUv?"#define EMISSIVEMAP_UV "+e.emissiveMapUv:"",e.bumpMapUv?"#define BUMPMAP_UV "+e.bumpMapUv:"",e.normalMapUv?"#define NORMALMAP_UV "+e.normalMapUv:"",e.displacementMapUv?"#define DISPLACEMENTMAP_UV "+e.displacementMapUv:"",e.metalnessMapUv?"#define METALNESSMAP_UV "+e.metalnessMapUv:"",e.roughnessMapUv?"#define ROUGHNESSMAP_UV "+e.roughnessMapUv:"",e.anisotropyMapUv?"#define ANISOTROPYMAP_UV "+e.anisotropyMapUv:"",e.clearcoatMapUv?"#define CLEARCOATMAP_UV "+e.clearcoatMapUv:"",e.clearcoatNormalMapUv?"#define CLEARCOAT_NORMALMAP_UV "+e.clearcoatNormalMapUv:"",e.clearcoatRoughnessMapUv?"#define CLEARCOAT_ROUGHNESSMAP_UV "+e.clearcoatRoughnessMapUv:"",e.iridescenceMapUv?"#define IRIDESCENCEMAP_UV "+e.iridescenceMapUv:"",e.iridescenceThicknessMapUv?"#define IRIDESCENCE_THICKNESSMAP_UV "+e.iridescenceThicknessMapUv:"",e.sheenColorMapUv?"#define SHEEN_COLORMAP_UV "+e.sheenColorMapUv:"",e.sheenRoughnessMapUv?"#define SHEEN_ROUGHNESSMAP_UV "+e.sheenRoughnessMapUv:"",e.specularMapUv?"#define SPECULARMAP_UV "+e.specularMapUv:"",e.specularColorMapUv?"#define SPECULAR_COLORMAP_UV "+e.specularColorMapUv:"",e.specularIntensityMapUv?"#define SPECULAR_INTENSITYMAP_UV "+e.specularIntensityMapUv:"",e.transmissionMapUv?"#define TRANSMISSIONMAP_UV "+e.transmissionMapUv:"",e.thicknessMapUv?"#define THICKNESSMAP_UV "+e.thicknessMapUv:"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.flatShading?"#define FLAT_SHADED":"",e.skinning?"#define USE_SKINNING":"",e.morphTargets?"#define USE_MORPHTARGETS":"",e.morphNormals&&e.flatShading===!1?"#define USE_MORPHNORMALS":"",e.morphColors?"#define USE_MORPHCOLORS":"",e.morphTargetsCount>0?"#define MORPHTARGETS_TEXTURE_STRIDE "+e.morphTextureStride:"",e.morphTargetsCount>0?"#define MORPHTARGETS_COUNT "+e.morphTargetsCount:"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.sizeAttenuation?"#define USE_SIZEATTENUATION":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 modelMatrix;","uniform mat4 modelViewMatrix;","uniform mat4 projectionMatrix;","uniform mat4 viewMatrix;","uniform mat3 normalMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;","#ifdef USE_INSTANCING","	attribute mat4 instanceMatrix;","#endif","#ifdef USE_INSTANCING_COLOR","	attribute vec3 instanceColor;","#endif","#ifdef USE_INSTANCING_MORPH","	uniform sampler2D morphTexture;","#endif","attribute vec3 position;","attribute vec3 normal;","attribute vec2 uv;","#ifdef USE_UV1","	attribute vec2 uv1;","#endif","#ifdef USE_UV2","	attribute vec2 uv2;","#endif","#ifdef USE_UV3","	attribute vec2 uv3;","#endif","#ifdef USE_TANGENT","	attribute vec4 tangent;","#endif","#if defined( USE_COLOR_ALPHA )","	attribute vec4 color;","#elif defined( USE_COLOR )","	attribute vec3 color;","#endif","#ifdef USE_SKINNING","	attribute vec4 skinIndex;","	attribute vec4 skinWeight;","#endif",`
`].filter(cr).join(`
`),p=[md(e),"#define SHADER_TYPE "+e.shaderType,"#define SHADER_NAME "+e.shaderName,_,e.useFog&&e.fog?"#define USE_FOG":"",e.useFog&&e.fogExp2?"#define FOG_EXP2":"",e.alphaToCoverage?"#define ALPHA_TO_COVERAGE":"",e.map?"#define USE_MAP":"",e.matcap?"#define USE_MATCAP":"",e.envMap?"#define USE_ENVMAP":"",e.envMap?"#define "+c:"",e.envMap?"#define "+u:"",e.envMap?"#define "+d:"",h?"#define CUBEUV_TEXEL_WIDTH "+h.texelWidth:"",h?"#define CUBEUV_TEXEL_HEIGHT "+h.texelHeight:"",h?"#define CUBEUV_MAX_MIP "+h.maxMip+".0":"",e.lightMap?"#define USE_LIGHTMAP":"",e.aoMap?"#define USE_AOMAP":"",e.bumpMap?"#define USE_BUMPMAP":"",e.normalMap?"#define USE_NORMALMAP":"",e.normalMapObjectSpace?"#define USE_NORMALMAP_OBJECTSPACE":"",e.normalMapTangentSpace?"#define USE_NORMALMAP_TANGENTSPACE":"",e.emissiveMap?"#define USE_EMISSIVEMAP":"",e.anisotropy?"#define USE_ANISOTROPY":"",e.anisotropyMap?"#define USE_ANISOTROPYMAP":"",e.clearcoat?"#define USE_CLEARCOAT":"",e.clearcoatMap?"#define USE_CLEARCOATMAP":"",e.clearcoatRoughnessMap?"#define USE_CLEARCOAT_ROUGHNESSMAP":"",e.clearcoatNormalMap?"#define USE_CLEARCOAT_NORMALMAP":"",e.dispersion?"#define USE_DISPERSION":"",e.iridescence?"#define USE_IRIDESCENCE":"",e.iridescenceMap?"#define USE_IRIDESCENCEMAP":"",e.iridescenceThicknessMap?"#define USE_IRIDESCENCE_THICKNESSMAP":"",e.specularMap?"#define USE_SPECULARMAP":"",e.specularColorMap?"#define USE_SPECULAR_COLORMAP":"",e.specularIntensityMap?"#define USE_SPECULAR_INTENSITYMAP":"",e.roughnessMap?"#define USE_ROUGHNESSMAP":"",e.metalnessMap?"#define USE_METALNESSMAP":"",e.alphaMap?"#define USE_ALPHAMAP":"",e.alphaTest?"#define USE_ALPHATEST":"",e.alphaHash?"#define USE_ALPHAHASH":"",e.sheen?"#define USE_SHEEN":"",e.sheenColorMap?"#define USE_SHEEN_COLORMAP":"",e.sheenRoughnessMap?"#define USE_SHEEN_ROUGHNESSMAP":"",e.transmission?"#define USE_TRANSMISSION":"",e.transmissionMap?"#define USE_TRANSMISSIONMAP":"",e.thicknessMap?"#define USE_THICKNESSMAP":"",e.vertexTangents&&e.flatShading===!1?"#define USE_TANGENT":"",e.vertexColors||e.instancingColor||e.batchingColor?"#define USE_COLOR":"",e.vertexAlphas?"#define USE_COLOR_ALPHA":"",e.vertexUv1s?"#define USE_UV1":"",e.vertexUv2s?"#define USE_UV2":"",e.vertexUv3s?"#define USE_UV3":"",e.pointsUvs?"#define USE_POINTS_UV":"",e.gradientMap?"#define USE_GRADIENTMAP":"",e.flatShading?"#define FLAT_SHADED":"",e.doubleSided?"#define DOUBLE_SIDED":"",e.flipSided?"#define FLIP_SIDED":"",e.shadowMapEnabled?"#define USE_SHADOWMAP":"",e.shadowMapEnabled?"#define "+l:"",e.premultipliedAlpha?"#define PREMULTIPLIED_ALPHA":"",e.numLightProbes>0?"#define USE_LIGHT_PROBES":"",e.decodeVideoTexture?"#define DECODE_VIDEO_TEXTURE":"",e.decodeVideoTextureEmissive?"#define DECODE_VIDEO_TEXTURE_EMISSIVE":"",e.logarithmicDepthBuffer?"#define USE_LOGARITHMIC_DEPTH_BUFFER":"",e.reversedDepthBuffer?"#define USE_REVERSED_DEPTH_BUFFER":"","uniform mat4 viewMatrix;","uniform vec3 cameraPosition;","uniform bool isOrthographic;",e.toneMapping!==Hn?"#define TONE_MAPPING":"",e.toneMapping!==Hn?Vt.tonemapping_pars_fragment:"",e.toneMapping!==Hn?Hg("toneMapping",e.toneMapping):"",e.dithering?"#define DITHERING":"",e.opaque?"#define OPAQUE":"",Vt.colorspace_pars_fragment,Vg("linearToOutputTexel",e.outputColorSpace),Gg(),e.useDepthPacking?"#define DEPTH_PACKING "+e.depthPacking:"",`
`].filter(cr).join(`
`)),a=Yl(a),a=ud(a,e),a=pd(a,e),o=Yl(o),o=ud(o,e),o=pd(o,e),a=fd(a),o=fd(o),e.isRawShaderMaterial!==!0&&(w=`#version 300 es
`,m=[f,"#define attribute in","#define varying out","#define texture2D texture"].join(`
`)+`
`+m,p=["#define varying in",e.glslVersion===Ll?"":"layout(location = 0) out highp vec4 pc_fragColor;",e.glslVersion===Ll?"":"#define gl_FragColor pc_fragColor","#define gl_FragDepthEXT gl_FragDepth","#define texture2D texture","#define textureCube texture","#define texture2DProj textureProj","#define texture2DLodEXT textureLod","#define texture2DProjLodEXT textureProjLod","#define textureCubeLodEXT textureLod","#define texture2DGradEXT textureGrad","#define texture2DProjGradEXT textureProjGrad","#define textureCubeGradEXT textureGrad"].join(`
`)+`
`+p);let E=w+m+a,M=w+p+o,P=cd(s,s.VERTEX_SHADER,E),R=cd(s,s.FRAGMENT_SHADER,M);s.attachShader(y,P),s.attachShader(y,R),e.index0AttributeName!==void 0?s.bindAttribLocation(y,0,e.index0AttributeName):e.morphTargets===!0&&s.bindAttribLocation(y,0,"position"),s.linkProgram(y);function C(D){if(i.debug.checkShaderErrors){let V=s.getProgramInfoLog(y)||"",W=s.getShaderInfoLog(P)||"",q=s.getShaderInfoLog(R)||"",J=V.trim(),$=W.trim(),st=q.trim(),H=!0,lt=!0;if(s.getProgramParameter(y,s.LINK_STATUS)===!1)if(H=!1,typeof i.debug.onShaderError=="function")i.debug.onShaderError(s,y,P,R);else{let pt=dd(s,P,"vertex"),Tt=dd(s,R,"fragment");console.error("THREE.WebGLProgram: Shader Error "+s.getError()+" - VALIDATE_STATUS "+s.getProgramParameter(y,s.VALIDATE_STATUS)+`

Material Name: `+D.name+`
Material Type: `+D.type+`

Program Info Log: `+J+`
`+pt+`
`+Tt)}else J!==""?console.warn("THREE.WebGLProgram: Program Info Log:",J):($===""||st==="")&&(lt=!1);lt&&(D.diagnostics={runnable:H,programLog:J,vertexShader:{log:$,prefix:m},fragmentShader:{log:st,prefix:p}})}s.deleteShader(P),s.deleteShader(R),B=new gs(s,y),b=$g(s,y)}let B;this.getUniforms=function(){return B===void 0&&C(this),B};let b;this.getAttributes=function(){return b===void 0&&C(this),b};let v=e.rendererExtensionParallelShaderCompile===!1;return this.isReady=function(){return v===!1&&(v=s.getProgramParameter(y,Og)),v},this.destroy=function(){n.releaseStatesOfProgram(this),s.deleteProgram(y),this.program=void 0},this.type=e.shaderType,this.name=e.shaderName,this.id=Bg++,this.cacheKey=t,this.usedTimes=1,this.program=y,this.vertexShader=P,this.fragmentShader=R,this}var s_=0,Zl=class{constructor(){this.shaderCache=new Map,this.materialCache=new Map}update(t){let e=t.vertexShader,n=t.fragmentShader,s=this._getShaderStage(e),r=this._getShaderStage(n),a=this._getShaderCacheForMaterial(t);return a.has(s)===!1&&(a.add(s),s.usedTimes++),a.has(r)===!1&&(a.add(r),r.usedTimes++),this}remove(t){let e=this.materialCache.get(t);for(let n of e)n.usedTimes--,n.usedTimes===0&&this.shaderCache.delete(n.code);return this.materialCache.delete(t),this}getVertexShaderID(t){return this._getShaderStage(t.vertexShader).id}getFragmentShaderID(t){return this._getShaderStage(t.fragmentShader).id}dispose(){this.shaderCache.clear(),this.materialCache.clear()}_getShaderCacheForMaterial(t){let e=this.materialCache,n=e.get(t);return n===void 0&&(n=new Set,e.set(t,n)),n}_getShaderStage(t){let e=this.shaderCache,n=e.get(t);return n===void 0&&(n=new Jl(t),e.set(t,n)),n}},Jl=class{constructor(t){this.id=s_++,this.code=t,this.usedTimes=0}};function r_(i,t,e,n,s,r,a){let o=new ss,l=new Zl,c=new Set,u=[],d=s.logarithmicDepthBuffer,h=s.vertexTextures,f=s.precision,_={MeshDepthMaterial:"depth",MeshDistanceMaterial:"distanceRGBA",MeshNormalMaterial:"normal",MeshBasicMaterial:"basic",MeshLambertMaterial:"lambert",MeshPhongMaterial:"phong",MeshToonMaterial:"toon",MeshStandardMaterial:"physical",MeshPhysicalMaterial:"physical",MeshMatcapMaterial:"matcap",LineBasicMaterial:"basic",LineDashedMaterial:"dashed",PointsMaterial:"points",ShadowMaterial:"shadow",SpriteMaterial:"sprite"};function y(b){return c.add(b),b===0?"uv":`uv${b}`}function m(b,v,D,V,W){let q=V.fog,J=W.geometry,$=b.isMeshStandardMaterial?V.environment:null,st=(b.isMeshStandardMaterial?e:t).get(b.envMap||$),H=st&&st.mapping===ir?st.image.height:null,lt=_[b.type];b.precision!==null&&(f=s.getMaxPrecision(b.precision),f!==b.precision&&console.warn("THREE.WebGLProgram.getParameters:",b.precision,"not supported, using",f,"instead."));let pt=J.morphAttributes.position||J.morphAttributes.normal||J.morphAttributes.color,Tt=pt!==void 0?pt.length:0,Gt=0;J.morphAttributes.position!==void 0&&(Gt=1),J.morphAttributes.normal!==void 0&&(Gt=2),J.morphAttributes.color!==void 0&&(Gt=3);let ee,re,Yt,Y;if(lt){let Zt=Cn[lt];ee=Zt.vertexShader,re=Zt.fragmentShader}else ee=b.vertexShader,re=b.fragmentShader,l.update(b),Yt=l.getVertexShaderID(b),Y=l.getFragmentShaderID(b);let j=i.getRenderTarget(),gt=i.state.buffers.depth.getReversed(),Nt=W.isInstancedMesh===!0,Et=W.isBatchedMesh===!0,Xt=!!b.map,Re=!!b.matcap,T=!!st,ae=!!b.aoMap,Ft=!!b.lightMap,It=!!b.bumpMap,yt=!!b.normalMap,oe=!!b.displacementMap,vt=!!b.emissiveMap,zt=!!b.metalnessMap,be=!!b.roughnessMap,pe=b.anisotropy>0,S=b.clearcoat>0,g=b.dispersion>0,O=b.iridescence>0,X=b.sheen>0,K=b.transmission>0,G=pe&&!!b.anisotropyMap,wt=S&&!!b.clearcoatMap,rt=S&&!!b.clearcoatNormalMap,bt=S&&!!b.clearcoatRoughnessMap,Mt=O&&!!b.iridescenceMap,nt=O&&!!b.iridescenceThicknessMap,dt=X&&!!b.sheenColorMap,Pt=X&&!!b.sheenRoughnessMap,St=!!b.specularMap,ct=!!b.specularColorMap,Bt=!!b.specularIntensityMap,I=K&&!!b.transmissionMap,it=K&&!!b.thicknessMap,at=!!b.gradientMap,mt=!!b.alphaMap,Q=b.alphaTest>0,Z=!!b.alphaHash,xt=!!b.extensions,Ut=Hn;b.toneMapped&&(j===null||j.isXRRenderTarget===!0)&&(Ut=i.toneMapping);let ne={shaderID:lt,shaderType:b.type,shaderName:b.name,vertexShader:ee,fragmentShader:re,defines:b.defines,customVertexShaderID:Yt,customFragmentShaderID:Y,isRawShaderMaterial:b.isRawShaderMaterial===!0,glslVersion:b.glslVersion,precision:f,batching:Et,batchingColor:Et&&W._colorsTexture!==null,instancing:Nt,instancingColor:Nt&&W.instanceColor!==null,instancingMorph:Nt&&W.morphTexture!==null,supportsVertexTextures:h,outputColorSpace:j===null?i.outputColorSpace:j.isXRRenderTarget===!0?j.texture.colorSpace:Mi,alphaToCoverage:!!b.alphaToCoverage,map:Xt,matcap:Re,envMap:T,envMapMode:T&&st.mapping,envMapCubeUVHeight:H,aoMap:ae,lightMap:Ft,bumpMap:It,normalMap:yt,displacementMap:h&&oe,emissiveMap:vt,normalMapObjectSpace:yt&&b.normalMapType===Oh,normalMapTangentSpace:yt&&b.normalMapType===Rl,metalnessMap:zt,roughnessMap:be,anisotropy:pe,anisotropyMap:G,clearcoat:S,clearcoatMap:wt,clearcoatNormalMap:rt,clearcoatRoughnessMap:bt,dispersion:g,iridescence:O,iridescenceMap:Mt,iridescenceThicknessMap:nt,sheen:X,sheenColorMap:dt,sheenRoughnessMap:Pt,specularMap:St,specularColorMap:ct,specularIntensityMap:Bt,transmission:K,transmissionMap:I,thicknessMap:it,gradientMap:at,opaque:b.transparent===!1&&b.blending===vi&&b.alphaToCoverage===!1,alphaMap:mt,alphaTest:Q,alphaHash:Z,combine:b.combine,mapUv:Xt&&y(b.map.channel),aoMapUv:ae&&y(b.aoMap.channel),lightMapUv:Ft&&y(b.lightMap.channel),bumpMapUv:It&&y(b.bumpMap.channel),normalMapUv:yt&&y(b.normalMap.channel),displacementMapUv:oe&&y(b.displacementMap.channel),emissiveMapUv:vt&&y(b.emissiveMap.channel),metalnessMapUv:zt&&y(b.metalnessMap.channel),roughnessMapUv:be&&y(b.roughnessMap.channel),anisotropyMapUv:G&&y(b.anisotropyMap.channel),clearcoatMapUv:wt&&y(b.clearcoatMap.channel),clearcoatNormalMapUv:rt&&y(b.clearcoatNormalMap.channel),clearcoatRoughnessMapUv:bt&&y(b.clearcoatRoughnessMap.channel),iridescenceMapUv:Mt&&y(b.iridescenceMap.channel),iridescenceThicknessMapUv:nt&&y(b.iridescenceThicknessMap.channel),sheenColorMapUv:dt&&y(b.sheenColorMap.channel),sheenRoughnessMapUv:Pt&&y(b.sheenRoughnessMap.channel),specularMapUv:St&&y(b.specularMap.channel),specularColorMapUv:ct&&y(b.specularColorMap.channel),specularIntensityMapUv:Bt&&y(b.specularIntensityMap.channel),transmissionMapUv:I&&y(b.transmissionMap.channel),thicknessMapUv:it&&y(b.thicknessMap.channel),alphaMapUv:mt&&y(b.alphaMap.channel),vertexTangents:!!J.attributes.tangent&&(yt||pe),vertexColors:b.vertexColors,vertexAlphas:b.vertexColors===!0&&!!J.attributes.color&&J.attributes.color.itemSize===4,pointsUvs:W.isPoints===!0&&!!J.attributes.uv&&(Xt||mt),fog:!!q,useFog:b.fog===!0,fogExp2:!!q&&q.isFogExp2,flatShading:b.flatShading===!0&&b.wireframe===!1,sizeAttenuation:b.sizeAttenuation===!0,logarithmicDepthBuffer:d,reversedDepthBuffer:gt,skinning:W.isSkinnedMesh===!0,morphTargets:J.morphAttributes.position!==void 0,morphNormals:J.morphAttributes.normal!==void 0,morphColors:J.morphAttributes.color!==void 0,morphTargetsCount:Tt,morphTextureStride:Gt,numDirLights:v.directional.length,numPointLights:v.point.length,numSpotLights:v.spot.length,numSpotLightMaps:v.spotLightMap.length,numRectAreaLights:v.rectArea.length,numHemiLights:v.hemi.length,numDirLightShadows:v.directionalShadowMap.length,numPointLightShadows:v.pointShadowMap.length,numSpotLightShadows:v.spotShadowMap.length,numSpotLightShadowsWithMaps:v.numSpotLightShadowsWithMaps,numLightProbes:v.numLightProbes,numClippingPlanes:a.numPlanes,numClipIntersection:a.numIntersection,dithering:b.dithering,shadowMapEnabled:i.shadowMap.enabled&&D.length>0,shadowMapType:i.shadowMap.type,toneMapping:Ut,decodeVideoTexture:Xt&&b.map.isVideoTexture===!0&&$t.getTransfer(b.map.colorSpace)===Kt,decodeVideoTextureEmissive:vt&&b.emissiveMap.isVideoTexture===!0&&$t.getTransfer(b.emissiveMap.colorSpace)===Kt,premultipliedAlpha:b.premultipliedAlpha,doubleSided:b.side===An,flipSided:b.side===ke,useDepthPacking:b.depthPacking>=0,depthPacking:b.depthPacking||0,index0AttributeName:b.index0AttributeName,extensionClipCullDistance:xt&&b.extensions.clipCullDistance===!0&&n.has("WEBGL_clip_cull_distance"),extensionMultiDraw:(xt&&b.extensions.multiDraw===!0||Et)&&n.has("WEBGL_multi_draw"),rendererExtensionParallelShaderCompile:n.has("KHR_parallel_shader_compile"),customProgramCacheKey:b.customProgramCacheKey()};return ne.vertexUv1s=c.has(1),ne.vertexUv2s=c.has(2),ne.vertexUv3s=c.has(3),c.clear(),ne}function p(b){let v=[];if(b.shaderID?v.push(b.shaderID):(v.push(b.customVertexShaderID),v.push(b.customFragmentShaderID)),b.defines!==void 0)for(let D in b.defines)v.push(D),v.push(b.defines[D]);return b.isRawShaderMaterial===!1&&(w(v,b),E(v,b),v.push(i.outputColorSpace)),v.push(b.customProgramCacheKey),v.join()}function w(b,v){b.push(v.precision),b.push(v.outputColorSpace),b.push(v.envMapMode),b.push(v.envMapCubeUVHeight),b.push(v.mapUv),b.push(v.alphaMapUv),b.push(v.lightMapUv),b.push(v.aoMapUv),b.push(v.bumpMapUv),b.push(v.normalMapUv),b.push(v.displacementMapUv),b.push(v.emissiveMapUv),b.push(v.metalnessMapUv),b.push(v.roughnessMapUv),b.push(v.anisotropyMapUv),b.push(v.clearcoatMapUv),b.push(v.clearcoatNormalMapUv),b.push(v.clearcoatRoughnessMapUv),b.push(v.iridescenceMapUv),b.push(v.iridescenceThicknessMapUv),b.push(v.sheenColorMapUv),b.push(v.sheenRoughnessMapUv),b.push(v.specularMapUv),b.push(v.specularColorMapUv),b.push(v.specularIntensityMapUv),b.push(v.transmissionMapUv),b.push(v.thicknessMapUv),b.push(v.combine),b.push(v.fogExp2),b.push(v.sizeAttenuation),b.push(v.morphTargetsCount),b.push(v.morphAttributeCount),b.push(v.numDirLights),b.push(v.numPointLights),b.push(v.numSpotLights),b.push(v.numSpotLightMaps),b.push(v.numHemiLights),b.push(v.numRectAreaLights),b.push(v.numDirLightShadows),b.push(v.numPointLightShadows),b.push(v.numSpotLightShadows),b.push(v.numSpotLightShadowsWithMaps),b.push(v.numLightProbes),b.push(v.shadowMapType),b.push(v.toneMapping),b.push(v.numClippingPlanes),b.push(v.numClipIntersection),b.push(v.depthPacking)}function E(b,v){o.disableAll(),v.supportsVertexTextures&&o.enable(0),v.instancing&&o.enable(1),v.instancingColor&&o.enable(2),v.instancingMorph&&o.enable(3),v.matcap&&o.enable(4),v.envMap&&o.enable(5),v.normalMapObjectSpace&&o.enable(6),v.normalMapTangentSpace&&o.enable(7),v.clearcoat&&o.enable(8),v.iridescence&&o.enable(9),v.alphaTest&&o.enable(10),v.vertexColors&&o.enable(11),v.vertexAlphas&&o.enable(12),v.vertexUv1s&&o.enable(13),v.vertexUv2s&&o.enable(14),v.vertexUv3s&&o.enable(15),v.vertexTangents&&o.enable(16),v.anisotropy&&o.enable(17),v.alphaHash&&o.enable(18),v.batching&&o.enable(19),v.dispersion&&o.enable(20),v.batchingColor&&o.enable(21),v.gradientMap&&o.enable(22),b.push(o.mask),o.disableAll(),v.fog&&o.enable(0),v.useFog&&o.enable(1),v.flatShading&&o.enable(2),v.logarithmicDepthBuffer&&o.enable(3),v.reversedDepthBuffer&&o.enable(4),v.skinning&&o.enable(5),v.morphTargets&&o.enable(6),v.morphNormals&&o.enable(7),v.morphColors&&o.enable(8),v.premultipliedAlpha&&o.enable(9),v.shadowMapEnabled&&o.enable(10),v.doubleSided&&o.enable(11),v.flipSided&&o.enable(12),v.useDepthPacking&&o.enable(13),v.dithering&&o.enable(14),v.transmission&&o.enable(15),v.sheen&&o.enable(16),v.opaque&&o.enable(17),v.pointsUvs&&o.enable(18),v.decodeVideoTexture&&o.enable(19),v.decodeVideoTextureEmissive&&o.enable(20),v.alphaToCoverage&&o.enable(21),b.push(o.mask)}function M(b){let v=_[b.type],D;if(v){let V=Cn[v];D=Yh.clone(V.uniforms)}else D=b.uniforms;return D}function P(b,v){let D;for(let V=0,W=u.length;V<W;V++){let q=u[V];if(q.cacheKey===v){D=q,++D.usedTimes;break}}return D===void 0&&(D=new i_(i,v,b,r),u.push(D)),D}function R(b){if(--b.usedTimes===0){let v=u.indexOf(b);u[v]=u[u.length-1],u.pop(),b.destroy()}}function C(b){l.remove(b)}function B(){l.dispose()}return{getParameters:m,getProgramCacheKey:p,getUniforms:M,acquireProgram:P,releaseProgram:R,releaseShaderCache:C,programs:u,dispose:B}}function a_(){let i=new WeakMap;function t(a){return i.has(a)}function e(a){let o=i.get(a);return o===void 0&&(o={},i.set(a,o)),o}function n(a){i.delete(a)}function s(a,o,l){i.get(a)[o]=l}function r(){i=new WeakMap}return{has:t,get:e,remove:n,update:s,dispose:r}}function o_(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.material.id!==t.material.id?i.material.id-t.material.id:i.z!==t.z?i.z-t.z:i.id-t.id}function gd(i,t){return i.groupOrder!==t.groupOrder?i.groupOrder-t.groupOrder:i.renderOrder!==t.renderOrder?i.renderOrder-t.renderOrder:i.z!==t.z?t.z-i.z:i.id-t.id}function _d(){let i=[],t=0,e=[],n=[],s=[];function r(){t=0,e.length=0,n.length=0,s.length=0}function a(d,h,f,_,y,m){let p=i[t];return p===void 0?(p={id:d.id,object:d,geometry:h,material:f,groupOrder:_,renderOrder:d.renderOrder,z:y,group:m},i[t]=p):(p.id=d.id,p.object=d,p.geometry=h,p.material=f,p.groupOrder=_,p.renderOrder=d.renderOrder,p.z=y,p.group=m),t++,p}function o(d,h,f,_,y,m){let p=a(d,h,f,_,y,m);f.transmission>0?n.push(p):f.transparent===!0?s.push(p):e.push(p)}function l(d,h,f,_,y,m){let p=a(d,h,f,_,y,m);f.transmission>0?n.unshift(p):f.transparent===!0?s.unshift(p):e.unshift(p)}function c(d,h){e.length>1&&e.sort(d||o_),n.length>1&&n.sort(h||gd),s.length>1&&s.sort(h||gd)}function u(){for(let d=t,h=i.length;d<h;d++){let f=i[d];if(f.id===null)break;f.id=null,f.object=null,f.geometry=null,f.material=null,f.group=null}}return{opaque:e,transmissive:n,transparent:s,init:r,push:o,unshift:l,finish:u,sort:c}}function l_(){let i=new WeakMap;function t(n,s){let r=i.get(n),a;return r===void 0?(a=new _d,i.set(n,[a])):s>=r.length?(a=new _d,r.push(a)):a=r[s],a}function e(){i=new WeakMap}return{get:t,dispose:e}}function c_(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={direction:new L,color:new kt};break;case"SpotLight":e={position:new L,direction:new L,color:new kt,distance:0,coneCos:0,penumbraCos:0,decay:0};break;case"PointLight":e={position:new L,color:new kt,distance:0,decay:0};break;case"HemisphereLight":e={direction:new L,skyColor:new kt,groundColor:new kt};break;case"RectAreaLight":e={color:new kt,position:new L,halfWidth:new L,halfHeight:new L};break}return i[t.id]=e,e}}}function h_(){let i={};return{get:function(t){if(i[t.id]!==void 0)return i[t.id];let e;switch(t.type){case"DirectionalLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Dt};break;case"SpotLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Dt};break;case"PointLight":e={shadowIntensity:1,shadowBias:0,shadowNormalBias:0,shadowRadius:1,shadowMapSize:new Dt,shadowCameraNear:1,shadowCameraFar:1e3};break}return i[t.id]=e,e}}}var d_=0;function u_(i,t){return(t.castShadow?2:0)-(i.castShadow?2:0)+(t.map?1:0)-(i.map?1:0)}function p_(i){let t=new c_,e=h_(),n={version:0,hash:{directionalLength:-1,pointLength:-1,spotLength:-1,rectAreaLength:-1,hemiLength:-1,numDirectionalShadows:-1,numPointShadows:-1,numSpotShadows:-1,numSpotMaps:-1,numLightProbes:-1},ambient:[0,0,0],probe:[],directional:[],directionalShadow:[],directionalShadowMap:[],directionalShadowMatrix:[],spot:[],spotLightMap:[],spotShadow:[],spotShadowMap:[],spotLightMatrix:[],rectArea:[],rectAreaLTC1:null,rectAreaLTC2:null,point:[],pointShadow:[],pointShadowMap:[],pointShadowMatrix:[],hemi:[],numSpotLightShadowsWithMaps:0,numLightProbes:0};for(let c=0;c<9;c++)n.probe.push(new L);let s=new L,r=new Jt,a=new Jt;function o(c){let u=0,d=0,h=0;for(let b=0;b<9;b++)n.probe[b].set(0,0,0);let f=0,_=0,y=0,m=0,p=0,w=0,E=0,M=0,P=0,R=0,C=0;c.sort(u_);for(let b=0,v=c.length;b<v;b++){let D=c[b],V=D.color,W=D.intensity,q=D.distance,J=D.shadow&&D.shadow.map?D.shadow.map.texture:null;if(D.isAmbientLight)u+=V.r*W,d+=V.g*W,h+=V.b*W;else if(D.isLightProbe){for(let $=0;$<9;$++)n.probe[$].addScaledVector(D.sh.coefficients[$],W);C++}else if(D.isDirectionalLight){let $=t.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity),D.castShadow){let st=D.shadow,H=e.get(D);H.shadowIntensity=st.intensity,H.shadowBias=st.bias,H.shadowNormalBias=st.normalBias,H.shadowRadius=st.radius,H.shadowMapSize=st.mapSize,n.directionalShadow[f]=H,n.directionalShadowMap[f]=J,n.directionalShadowMatrix[f]=D.shadow.matrix,w++}n.directional[f]=$,f++}else if(D.isSpotLight){let $=t.get(D);$.position.setFromMatrixPosition(D.matrixWorld),$.color.copy(V).multiplyScalar(W),$.distance=q,$.coneCos=Math.cos(D.angle),$.penumbraCos=Math.cos(D.angle*(1-D.penumbra)),$.decay=D.decay,n.spot[y]=$;let st=D.shadow;if(D.map&&(n.spotLightMap[P]=D.map,P++,st.updateMatrices(D),D.castShadow&&R++),n.spotLightMatrix[y]=st.matrix,D.castShadow){let H=e.get(D);H.shadowIntensity=st.intensity,H.shadowBias=st.bias,H.shadowNormalBias=st.normalBias,H.shadowRadius=st.radius,H.shadowMapSize=st.mapSize,n.spotShadow[y]=H,n.spotShadowMap[y]=J,M++}y++}else if(D.isRectAreaLight){let $=t.get(D);$.color.copy(V).multiplyScalar(W),$.halfWidth.set(D.width*.5,0,0),$.halfHeight.set(0,D.height*.5,0),n.rectArea[m]=$,m++}else if(D.isPointLight){let $=t.get(D);if($.color.copy(D.color).multiplyScalar(D.intensity),$.distance=D.distance,$.decay=D.decay,D.castShadow){let st=D.shadow,H=e.get(D);H.shadowIntensity=st.intensity,H.shadowBias=st.bias,H.shadowNormalBias=st.normalBias,H.shadowRadius=st.radius,H.shadowMapSize=st.mapSize,H.shadowCameraNear=st.camera.near,H.shadowCameraFar=st.camera.far,n.pointShadow[_]=H,n.pointShadowMap[_]=J,n.pointShadowMatrix[_]=D.shadow.matrix,E++}n.point[_]=$,_++}else if(D.isHemisphereLight){let $=t.get(D);$.skyColor.copy(D.color).multiplyScalar(W),$.groundColor.copy(D.groundColor).multiplyScalar(W),n.hemi[p]=$,p++}}m>0&&(i.has("OES_texture_float_linear")===!0?(n.rectAreaLTC1=ot.LTC_FLOAT_1,n.rectAreaLTC2=ot.LTC_FLOAT_2):(n.rectAreaLTC1=ot.LTC_HALF_1,n.rectAreaLTC2=ot.LTC_HALF_2)),n.ambient[0]=u,n.ambient[1]=d,n.ambient[2]=h;let B=n.hash;(B.directionalLength!==f||B.pointLength!==_||B.spotLength!==y||B.rectAreaLength!==m||B.hemiLength!==p||B.numDirectionalShadows!==w||B.numPointShadows!==E||B.numSpotShadows!==M||B.numSpotMaps!==P||B.numLightProbes!==C)&&(n.directional.length=f,n.spot.length=y,n.rectArea.length=m,n.point.length=_,n.hemi.length=p,n.directionalShadow.length=w,n.directionalShadowMap.length=w,n.pointShadow.length=E,n.pointShadowMap.length=E,n.spotShadow.length=M,n.spotShadowMap.length=M,n.directionalShadowMatrix.length=w,n.pointShadowMatrix.length=E,n.spotLightMatrix.length=M+P-R,n.spotLightMap.length=P,n.numSpotLightShadowsWithMaps=R,n.numLightProbes=C,B.directionalLength=f,B.pointLength=_,B.spotLength=y,B.rectAreaLength=m,B.hemiLength=p,B.numDirectionalShadows=w,B.numPointShadows=E,B.numSpotShadows=M,B.numSpotMaps=P,B.numLightProbes=C,n.version=d_++)}function l(c,u){let d=0,h=0,f=0,_=0,y=0,m=u.matrixWorldInverse;for(let p=0,w=c.length;p<w;p++){let E=c[p];if(E.isDirectionalLight){let M=n.directional[d];M.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),d++}else if(E.isSpotLight){let M=n.spot[f];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(m),M.direction.setFromMatrixPosition(E.matrixWorld),s.setFromMatrixPosition(E.target.matrixWorld),M.direction.sub(s),M.direction.transformDirection(m),f++}else if(E.isRectAreaLight){let M=n.rectArea[_];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(m),a.identity(),r.copy(E.matrixWorld),r.premultiply(m),a.extractRotation(r),M.halfWidth.set(E.width*.5,0,0),M.halfHeight.set(0,E.height*.5,0),M.halfWidth.applyMatrix4(a),M.halfHeight.applyMatrix4(a),_++}else if(E.isPointLight){let M=n.point[h];M.position.setFromMatrixPosition(E.matrixWorld),M.position.applyMatrix4(m),h++}else if(E.isHemisphereLight){let M=n.hemi[y];M.direction.setFromMatrixPosition(E.matrixWorld),M.direction.transformDirection(m),y++}}}return{setup:o,setupView:l,state:n}}function xd(i){let t=new p_(i),e=[],n=[];function s(u){c.camera=u,e.length=0,n.length=0}function r(u){e.push(u)}function a(u){n.push(u)}function o(){t.setup(e)}function l(u){t.setupView(e,u)}let c={lightsArray:e,shadowsArray:n,camera:null,lights:t,transmissionRenderTarget:{}};return{init:s,state:c,setupLights:o,setupLightsView:l,pushLight:r,pushShadow:a}}function f_(i){let t=new WeakMap;function e(s,r=0){let a=t.get(s),o;return a===void 0?(o=new xd(i),t.set(s,[o])):r>=a.length?(o=new xd(i),a.push(o)):o=a[r],o}function n(){t=new WeakMap}return{get:e,dispose:n}}var m_=`void main() {
	gl_Position = vec4( position, 1.0 );
}`,g_=`uniform sampler2D shadow_pass;
uniform vec2 resolution;
uniform float radius;
#include <packing>
void main() {
	const float samples = float( VSM_SAMPLES );
	float mean = 0.0;
	float squared_mean = 0.0;
	float uvStride = samples <= 1.0 ? 0.0 : 2.0 / ( samples - 1.0 );
	float uvStart = samples <= 1.0 ? 0.0 : - 1.0;
	for ( float i = 0.0; i < samples; i ++ ) {
		float uvOffset = uvStart + i * uvStride;
		#ifdef HORIZONTAL_PASS
			vec2 distribution = unpackRGBATo2Half( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( uvOffset, 0.0 ) * radius ) / resolution ) );
			mean += distribution.x;
			squared_mean += distribution.y * distribution.y + distribution.x * distribution.x;
		#else
			float depth = unpackRGBAToDepth( texture2D( shadow_pass, ( gl_FragCoord.xy + vec2( 0.0, uvOffset ) * radius ) / resolution ) );
			mean += depth;
			squared_mean += depth * depth;
		#endif
	}
	mean = mean / samples;
	squared_mean = squared_mean / samples;
	float std_dev = sqrt( squared_mean - mean * mean );
	gl_FragColor = pack2HalfToRGBA( vec2( mean, std_dev ) );
}`;function __(i,t,e){let n=new os,s=new Dt,r=new Dt,a=new de,o=new ra({depthPacking:Fh}),l=new aa,c={},u=e.maxTextureSize,d={[Bn]:ke,[ke]:Bn,[An]:An},h=new _n({defines:{VSM_SAMPLES:8},uniforms:{shadow_pass:{value:null},resolution:{value:new Dt},radius:{value:4}},vertexShader:m_,fragmentShader:g_}),f=h.clone();f.defines.HORIZONTAL_PASS=1;let _=new $e;_.setAttribute("position",new we(new Float32Array([-1,-1,.5,3,-1,.5,-1,3,.5]),3));let y=new Te(_,h),m=this;this.enabled=!1,this.autoUpdate=!0,this.needsUpdate=!1,this.type=gl;let p=this.type;this.render=function(R,C,B){if(m.enabled===!1||m.autoUpdate===!1&&m.needsUpdate===!1||R.length===0)return;let b=i.getRenderTarget(),v=i.getActiveCubeFace(),D=i.getActiveMipmapLevel(),V=i.state;V.setBlending(Vn),V.buffers.depth.getReversed()===!0?V.buffers.color.setClear(0,0,0,0):V.buffers.color.setClear(1,1,1,1),V.buffers.depth.setTest(!0),V.setScissorTest(!1);let W=p!==Tn&&this.type===Tn,q=p===Tn&&this.type!==Tn;for(let J=0,$=R.length;J<$;J++){let st=R[J],H=st.shadow;if(H===void 0){console.warn("THREE.WebGLShadowMap:",st,"has no shadow.");continue}if(H.autoUpdate===!1&&H.needsUpdate===!1)continue;s.copy(H.mapSize);let lt=H.getFrameExtents();if(s.multiply(lt),r.copy(H.mapSize),(s.x>u||s.y>u)&&(s.x>u&&(r.x=Math.floor(u/lt.x),s.x=r.x*lt.x,H.mapSize.x=r.x),s.y>u&&(r.y=Math.floor(u/lt.y),s.y=r.y*lt.y,H.mapSize.y=r.y)),H.map===null||W===!0||q===!0){let Tt=this.type!==Tn?{minFilter:We,magFilter:We}:{};H.map!==null&&H.map.dispose(),H.map=new En(s.x,s.y,Tt),H.map.texture.name=st.name+".shadowMap",H.camera.updateProjectionMatrix()}i.setRenderTarget(H.map),i.clear();let pt=H.getViewportCount();for(let Tt=0;Tt<pt;Tt++){let Gt=H.getViewport(Tt);a.set(r.x*Gt.x,r.y*Gt.y,r.x*Gt.z,r.y*Gt.w),V.viewport(a),H.updateMatrices(st,Tt),n=H.getFrustum(),M(C,B,H.camera,st,this.type)}H.isPointLightShadow!==!0&&this.type===Tn&&w(H,B),H.needsUpdate=!1}p=this.type,m.needsUpdate=!1,i.setRenderTarget(b,v,D)};function w(R,C){let B=t.update(y);h.defines.VSM_SAMPLES!==R.blurSamples&&(h.defines.VSM_SAMPLES=R.blurSamples,f.defines.VSM_SAMPLES=R.blurSamples,h.needsUpdate=!0,f.needsUpdate=!0),R.mapPass===null&&(R.mapPass=new En(s.x,s.y)),h.uniforms.shadow_pass.value=R.map.texture,h.uniforms.resolution.value=R.mapSize,h.uniforms.radius.value=R.radius,i.setRenderTarget(R.mapPass),i.clear(),i.renderBufferDirect(C,null,B,h,y,null),f.uniforms.shadow_pass.value=R.mapPass.texture,f.uniforms.resolution.value=R.mapSize,f.uniforms.radius.value=R.radius,i.setRenderTarget(R.map),i.clear(),i.renderBufferDirect(C,null,B,f,y,null)}function E(R,C,B,b){let v=null,D=B.isPointLight===!0?R.customDistanceMaterial:R.customDepthMaterial;if(D!==void 0)v=D;else if(v=B.isPointLight===!0?l:o,i.localClippingEnabled&&C.clipShadows===!0&&Array.isArray(C.clippingPlanes)&&C.clippingPlanes.length!==0||C.displacementMap&&C.displacementScale!==0||C.alphaMap&&C.alphaTest>0||C.map&&C.alphaTest>0||C.alphaToCoverage===!0){let V=v.uuid,W=C.uuid,q=c[V];q===void 0&&(q={},c[V]=q);let J=q[W];J===void 0&&(J=v.clone(),q[W]=J,C.addEventListener("dispose",P)),v=J}if(v.visible=C.visible,v.wireframe=C.wireframe,b===Tn?v.side=C.shadowSide!==null?C.shadowSide:C.side:v.side=C.shadowSide!==null?C.shadowSide:d[C.side],v.alphaMap=C.alphaMap,v.alphaTest=C.alphaToCoverage===!0?.5:C.alphaTest,v.map=C.map,v.clipShadows=C.clipShadows,v.clippingPlanes=C.clippingPlanes,v.clipIntersection=C.clipIntersection,v.displacementMap=C.displacementMap,v.displacementScale=C.displacementScale,v.displacementBias=C.displacementBias,v.wireframeLinewidth=C.wireframeLinewidth,v.linewidth=C.linewidth,B.isPointLight===!0&&v.isMeshDistanceMaterial===!0){let V=i.properties.get(v);V.light=B}return v}function M(R,C,B,b,v){if(R.visible===!1)return;if(R.layers.test(C.layers)&&(R.isMesh||R.isLine||R.isPoints)&&(R.castShadow||R.receiveShadow&&v===Tn)&&(!R.frustumCulled||n.intersectsObject(R))){R.modelViewMatrix.multiplyMatrices(B.matrixWorldInverse,R.matrixWorld);let W=t.update(R),q=R.material;if(Array.isArray(q)){let J=W.groups;for(let $=0,st=J.length;$<st;$++){let H=J[$],lt=q[H.materialIndex];if(lt&&lt.visible){let pt=E(R,lt,b,v);R.onBeforeShadow(i,R,C,B,W,pt,H),i.renderBufferDirect(B,null,W,pt,R,H),R.onAfterShadow(i,R,C,B,W,pt,H)}}}else if(q.visible){let J=E(R,q,b,v);R.onBeforeShadow(i,R,C,B,W,J,null),i.renderBufferDirect(B,null,W,J,R,null),R.onAfterShadow(i,R,C,B,W,J,null)}}let V=R.children;for(let W=0,q=V.length;W<q;W++)M(V[W],C,B,b,v)}function P(R){R.target.removeEventListener("dispose",P);for(let B in c){let b=c[B],v=R.target.uuid;v in b&&(b[v].dispose(),delete b[v])}}}var x_={[xa]:ya,[va]:Sa,[ba]:wa,[bi]:Ma,[ya]:xa,[Sa]:va,[wa]:ba,[Ma]:bi};function y_(i,t){function e(){let I=!1,it=new de,at=null,mt=new de(0,0,0,0);return{setMask:function(Q){at!==Q&&!I&&(i.colorMask(Q,Q,Q,Q),at=Q)},setLocked:function(Q){I=Q},setClear:function(Q,Z,xt,Ut,ne){ne===!0&&(Q*=Ut,Z*=Ut,xt*=Ut),it.set(Q,Z,xt,Ut),mt.equals(it)===!1&&(i.clearColor(Q,Z,xt,Ut),mt.copy(it))},reset:function(){I=!1,at=null,mt.set(-1,0,0,0)}}}function n(){let I=!1,it=!1,at=null,mt=null,Q=null;return{setReversed:function(Z){if(it!==Z){let xt=t.get("EXT_clip_control");Z?xt.clipControlEXT(xt.LOWER_LEFT_EXT,xt.ZERO_TO_ONE_EXT):xt.clipControlEXT(xt.LOWER_LEFT_EXT,xt.NEGATIVE_ONE_TO_ONE_EXT),it=Z;let Ut=Q;Q=null,this.setClear(Ut)}},getReversed:function(){return it},setTest:function(Z){Z?j(i.DEPTH_TEST):gt(i.DEPTH_TEST)},setMask:function(Z){at!==Z&&!I&&(i.depthMask(Z),at=Z)},setFunc:function(Z){if(it&&(Z=x_[Z]),mt!==Z){switch(Z){case xa:i.depthFunc(i.NEVER);break;case ya:i.depthFunc(i.ALWAYS);break;case va:i.depthFunc(i.LESS);break;case bi:i.depthFunc(i.LEQUAL);break;case ba:i.depthFunc(i.EQUAL);break;case Ma:i.depthFunc(i.GEQUAL);break;case Sa:i.depthFunc(i.GREATER);break;case wa:i.depthFunc(i.NOTEQUAL);break;default:i.depthFunc(i.LEQUAL)}mt=Z}},setLocked:function(Z){I=Z},setClear:function(Z){Q!==Z&&(it&&(Z=1-Z),i.clearDepth(Z),Q=Z)},reset:function(){I=!1,at=null,mt=null,Q=null,it=!1}}}function s(){let I=!1,it=null,at=null,mt=null,Q=null,Z=null,xt=null,Ut=null,ne=null;return{setTest:function(Zt){I||(Zt?j(i.STENCIL_TEST):gt(i.STENCIL_TEST))},setMask:function(Zt){it!==Zt&&!I&&(i.stencilMask(Zt),it=Zt)},setFunc:function(Zt,Rn,vn){(at!==Zt||mt!==Rn||Q!==vn)&&(i.stencilFunc(Zt,Rn,vn),at=Zt,mt=Rn,Q=vn)},setOp:function(Zt,Rn,vn){(Z!==Zt||xt!==Rn||Ut!==vn)&&(i.stencilOp(Zt,Rn,vn),Z=Zt,xt=Rn,Ut=vn)},setLocked:function(Zt){I=Zt},setClear:function(Zt){ne!==Zt&&(i.clearStencil(Zt),ne=Zt)},reset:function(){I=!1,it=null,at=null,mt=null,Q=null,Z=null,xt=null,Ut=null,ne=null}}}let r=new e,a=new n,o=new s,l=new WeakMap,c=new WeakMap,u={},d={},h=new WeakMap,f=[],_=null,y=!1,m=null,p=null,w=null,E=null,M=null,P=null,R=null,C=new kt(0,0,0),B=0,b=!1,v=null,D=null,V=null,W=null,q=null,J=i.getParameter(i.MAX_COMBINED_TEXTURE_IMAGE_UNITS),$=!1,st=0,H=i.getParameter(i.VERSION);H.indexOf("WebGL")!==-1?(st=parseFloat(/^WebGL (\d)/.exec(H)[1]),$=st>=1):H.indexOf("OpenGL ES")!==-1&&(st=parseFloat(/^OpenGL ES (\d)/.exec(H)[1]),$=st>=2);let lt=null,pt={},Tt=i.getParameter(i.SCISSOR_BOX),Gt=i.getParameter(i.VIEWPORT),ee=new de().fromArray(Tt),re=new de().fromArray(Gt);function Yt(I,it,at,mt){let Q=new Uint8Array(4),Z=i.createTexture();i.bindTexture(I,Z),i.texParameteri(I,i.TEXTURE_MIN_FILTER,i.NEAREST),i.texParameteri(I,i.TEXTURE_MAG_FILTER,i.NEAREST);for(let xt=0;xt<at;xt++)I===i.TEXTURE_3D||I===i.TEXTURE_2D_ARRAY?i.texImage3D(it,0,i.RGBA,1,1,mt,0,i.RGBA,i.UNSIGNED_BYTE,Q):i.texImage2D(it+xt,0,i.RGBA,1,1,0,i.RGBA,i.UNSIGNED_BYTE,Q);return Z}let Y={};Y[i.TEXTURE_2D]=Yt(i.TEXTURE_2D,i.TEXTURE_2D,1),Y[i.TEXTURE_CUBE_MAP]=Yt(i.TEXTURE_CUBE_MAP,i.TEXTURE_CUBE_MAP_POSITIVE_X,6),Y[i.TEXTURE_2D_ARRAY]=Yt(i.TEXTURE_2D_ARRAY,i.TEXTURE_2D_ARRAY,1,1),Y[i.TEXTURE_3D]=Yt(i.TEXTURE_3D,i.TEXTURE_3D,1,1),r.setClear(0,0,0,1),a.setClear(1),o.setClear(0),j(i.DEPTH_TEST),a.setFunc(bi),It(!1),yt(ml),j(i.CULL_FACE),ae(Vn);function j(I){u[I]!==!0&&(i.enable(I),u[I]=!0)}function gt(I){u[I]!==!1&&(i.disable(I),u[I]=!1)}function Nt(I,it){return d[I]!==it?(i.bindFramebuffer(I,it),d[I]=it,I===i.DRAW_FRAMEBUFFER&&(d[i.FRAMEBUFFER]=it),I===i.FRAMEBUFFER&&(d[i.DRAW_FRAMEBUFFER]=it),!0):!1}function Et(I,it){let at=f,mt=!1;if(I){at=h.get(it),at===void 0&&(at=[],h.set(it,at));let Q=I.textures;if(at.length!==Q.length||at[0]!==i.COLOR_ATTACHMENT0){for(let Z=0,xt=Q.length;Z<xt;Z++)at[Z]=i.COLOR_ATTACHMENT0+Z;at.length=Q.length,mt=!0}}else at[0]!==i.BACK&&(at[0]=i.BACK,mt=!0);mt&&i.drawBuffers(at)}function Xt(I){return _!==I?(i.useProgram(I),_=I,!0):!1}let Re={[ni]:i.FUNC_ADD,[ch]:i.FUNC_SUBTRACT,[hh]:i.FUNC_REVERSE_SUBTRACT};Re[dh]=i.MIN,Re[uh]=i.MAX;let T={[ph]:i.ZERO,[fh]:i.ONE,[mh]:i.SRC_COLOR,[Wr]:i.SRC_ALPHA,[bh]:i.SRC_ALPHA_SATURATE,[yh]:i.DST_COLOR,[_h]:i.DST_ALPHA,[gh]:i.ONE_MINUS_SRC_COLOR,[Xr]:i.ONE_MINUS_SRC_ALPHA,[vh]:i.ONE_MINUS_DST_COLOR,[xh]:i.ONE_MINUS_DST_ALPHA,[Mh]:i.CONSTANT_COLOR,[Sh]:i.ONE_MINUS_CONSTANT_COLOR,[wh]:i.CONSTANT_ALPHA,[Eh]:i.ONE_MINUS_CONSTANT_ALPHA};function ae(I,it,at,mt,Q,Z,xt,Ut,ne,Zt){if(I===Vn){y===!0&&(gt(i.BLEND),y=!1);return}if(y===!1&&(j(i.BLEND),y=!0),I!==lh){if(I!==m||Zt!==b){if((p!==ni||M!==ni)&&(i.blendEquation(i.FUNC_ADD),p=ni,M=ni),Zt)switch(I){case vi:i.blendFuncSeparate(i.ONE,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case _l:i.blendFunc(i.ONE,i.ONE);break;case xl:i.blendFuncSeparate(i.ZERO,i.ONE_MINUS_SRC_COLOR,i.ZERO,i.ONE);break;case yl:i.blendFuncSeparate(i.DST_COLOR,i.ONE_MINUS_SRC_ALPHA,i.ZERO,i.ONE);break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}else switch(I){case vi:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE_MINUS_SRC_ALPHA,i.ONE,i.ONE_MINUS_SRC_ALPHA);break;case _l:i.blendFuncSeparate(i.SRC_ALPHA,i.ONE,i.ONE,i.ONE);break;case xl:console.error("THREE.WebGLState: SubtractiveBlending requires material.premultipliedAlpha = true");break;case yl:console.error("THREE.WebGLState: MultiplyBlending requires material.premultipliedAlpha = true");break;default:console.error("THREE.WebGLState: Invalid blending: ",I);break}w=null,E=null,P=null,R=null,C.set(0,0,0),B=0,m=I,b=Zt}return}Q=Q||it,Z=Z||at,xt=xt||mt,(it!==p||Q!==M)&&(i.blendEquationSeparate(Re[it],Re[Q]),p=it,M=Q),(at!==w||mt!==E||Z!==P||xt!==R)&&(i.blendFuncSeparate(T[at],T[mt],T[Z],T[xt]),w=at,E=mt,P=Z,R=xt),(Ut.equals(C)===!1||ne!==B)&&(i.blendColor(Ut.r,Ut.g,Ut.b,ne),C.copy(Ut),B=ne),m=I,b=!1}function Ft(I,it){I.side===An?gt(i.CULL_FACE):j(i.CULL_FACE);let at=I.side===ke;it&&(at=!at),It(at),I.blending===vi&&I.transparent===!1?ae(Vn):ae(I.blending,I.blendEquation,I.blendSrc,I.blendDst,I.blendEquationAlpha,I.blendSrcAlpha,I.blendDstAlpha,I.blendColor,I.blendAlpha,I.premultipliedAlpha),a.setFunc(I.depthFunc),a.setTest(I.depthTest),a.setMask(I.depthWrite),r.setMask(I.colorWrite);let mt=I.stencilWrite;o.setTest(mt),mt&&(o.setMask(I.stencilWriteMask),o.setFunc(I.stencilFunc,I.stencilRef,I.stencilFuncMask),o.setOp(I.stencilFail,I.stencilZFail,I.stencilZPass)),vt(I.polygonOffset,I.polygonOffsetFactor,I.polygonOffsetUnits),I.alphaToCoverage===!0?j(i.SAMPLE_ALPHA_TO_COVERAGE):gt(i.SAMPLE_ALPHA_TO_COVERAGE)}function It(I){v!==I&&(I?i.frontFace(i.CW):i.frontFace(i.CCW),v=I)}function yt(I){I!==ah?(j(i.CULL_FACE),I!==D&&(I===ml?i.cullFace(i.BACK):I===oh?i.cullFace(i.FRONT):i.cullFace(i.FRONT_AND_BACK))):gt(i.CULL_FACE),D=I}function oe(I){I!==V&&($&&i.lineWidth(I),V=I)}function vt(I,it,at){I?(j(i.POLYGON_OFFSET_FILL),(W!==it||q!==at)&&(i.polygonOffset(it,at),W=it,q=at)):gt(i.POLYGON_OFFSET_FILL)}function zt(I){I?j(i.SCISSOR_TEST):gt(i.SCISSOR_TEST)}function be(I){I===void 0&&(I=i.TEXTURE0+J-1),lt!==I&&(i.activeTexture(I),lt=I)}function pe(I,it,at){at===void 0&&(lt===null?at=i.TEXTURE0+J-1:at=lt);let mt=pt[at];mt===void 0&&(mt={type:void 0,texture:void 0},pt[at]=mt),(mt.type!==I||mt.texture!==it)&&(lt!==at&&(i.activeTexture(at),lt=at),i.bindTexture(I,it||Y[I]),mt.type=I,mt.texture=it)}function S(){let I=pt[lt];I!==void 0&&I.type!==void 0&&(i.bindTexture(I.type,null),I.type=void 0,I.texture=void 0)}function g(){try{i.compressedTexImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function O(){try{i.compressedTexImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function X(){try{i.texSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function K(){try{i.texSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function G(){try{i.compressedTexSubImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function wt(){try{i.compressedTexSubImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function rt(){try{i.texStorage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function bt(){try{i.texStorage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function Mt(){try{i.texImage2D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function nt(){try{i.texImage3D(...arguments)}catch(I){console.error("THREE.WebGLState:",I)}}function dt(I){ee.equals(I)===!1&&(i.scissor(I.x,I.y,I.z,I.w),ee.copy(I))}function Pt(I){re.equals(I)===!1&&(i.viewport(I.x,I.y,I.z,I.w),re.copy(I))}function St(I,it){let at=c.get(it);at===void 0&&(at=new WeakMap,c.set(it,at));let mt=at.get(I);mt===void 0&&(mt=i.getUniformBlockIndex(it,I.name),at.set(I,mt))}function ct(I,it){let mt=c.get(it).get(I);l.get(it)!==mt&&(i.uniformBlockBinding(it,mt,I.__bindingPointIndex),l.set(it,mt))}function Bt(){i.disable(i.BLEND),i.disable(i.CULL_FACE),i.disable(i.DEPTH_TEST),i.disable(i.POLYGON_OFFSET_FILL),i.disable(i.SCISSOR_TEST),i.disable(i.STENCIL_TEST),i.disable(i.SAMPLE_ALPHA_TO_COVERAGE),i.blendEquation(i.FUNC_ADD),i.blendFunc(i.ONE,i.ZERO),i.blendFuncSeparate(i.ONE,i.ZERO,i.ONE,i.ZERO),i.blendColor(0,0,0,0),i.colorMask(!0,!0,!0,!0),i.clearColor(0,0,0,0),i.depthMask(!0),i.depthFunc(i.LESS),a.setReversed(!1),i.clearDepth(1),i.stencilMask(4294967295),i.stencilFunc(i.ALWAYS,0,4294967295),i.stencilOp(i.KEEP,i.KEEP,i.KEEP),i.clearStencil(0),i.cullFace(i.BACK),i.frontFace(i.CCW),i.polygonOffset(0,0),i.activeTexture(i.TEXTURE0),i.bindFramebuffer(i.FRAMEBUFFER,null),i.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),i.bindFramebuffer(i.READ_FRAMEBUFFER,null),i.useProgram(null),i.lineWidth(1),i.scissor(0,0,i.canvas.width,i.canvas.height),i.viewport(0,0,i.canvas.width,i.canvas.height),u={},lt=null,pt={},d={},h=new WeakMap,f=[],_=null,y=!1,m=null,p=null,w=null,E=null,M=null,P=null,R=null,C=new kt(0,0,0),B=0,b=!1,v=null,D=null,V=null,W=null,q=null,ee.set(0,0,i.canvas.width,i.canvas.height),re.set(0,0,i.canvas.width,i.canvas.height),r.reset(),a.reset(),o.reset()}return{buffers:{color:r,depth:a,stencil:o},enable:j,disable:gt,bindFramebuffer:Nt,drawBuffers:Et,useProgram:Xt,setBlending:ae,setMaterial:Ft,setFlipSided:It,setCullFace:yt,setLineWidth:oe,setPolygonOffset:vt,setScissorTest:zt,activeTexture:be,bindTexture:pe,unbindTexture:S,compressedTexImage2D:g,compressedTexImage3D:O,texImage2D:Mt,texImage3D:nt,updateUBOMapping:St,uniformBlockBinding:ct,texStorage2D:rt,texStorage3D:bt,texSubImage2D:X,texSubImage3D:K,compressedTexSubImage2D:G,compressedTexSubImage3D:wt,scissor:dt,viewport:Pt,reset:Bt}}function v_(i,t,e,n,s,r,a){let o=t.has("WEBGL_multisampled_render_to_texture")?t.get("WEBGL_multisampled_render_to_texture"):null,l=typeof navigator>"u"?!1:/OculusBrowser/g.test(navigator.userAgent),c=new Dt,u=new WeakMap,d,h=new WeakMap,f=!1;try{f=typeof OffscreenCanvas<"u"&&new OffscreenCanvas(1,1).getContext("2d")!==null}catch{}function _(S,g){return f?new OffscreenCanvas(S,g):Bs("canvas")}function y(S,g,O){let X=1,K=pe(S);if((K.width>O||K.height>O)&&(X=O/Math.max(K.width,K.height)),X<1)if(typeof HTMLImageElement<"u"&&S instanceof HTMLImageElement||typeof HTMLCanvasElement<"u"&&S instanceof HTMLCanvasElement||typeof ImageBitmap<"u"&&S instanceof ImageBitmap||typeof VideoFrame<"u"&&S instanceof VideoFrame){let G=Math.floor(X*K.width),wt=Math.floor(X*K.height);d===void 0&&(d=_(G,wt));let rt=g?_(G,wt):d;return rt.width=G,rt.height=wt,rt.getContext("2d").drawImage(S,0,0,G,wt),console.warn("THREE.WebGLRenderer: Texture has been resized from ("+K.width+"x"+K.height+") to ("+G+"x"+wt+")."),rt}else return"data"in S&&console.warn("THREE.WebGLRenderer: Image in DataTexture is too big ("+K.width+"x"+K.height+")."),S;return S}function m(S){return S.generateMipmaps}function p(S){i.generateMipmap(S)}function w(S){return S.isWebGLCubeRenderTarget?i.TEXTURE_CUBE_MAP:S.isWebGL3DRenderTarget?i.TEXTURE_3D:S.isWebGLArrayRenderTarget||S.isCompressedArrayTexture?i.TEXTURE_2D_ARRAY:i.TEXTURE_2D}function E(S,g,O,X,K=!1){if(S!==null){if(i[S]!==void 0)return i[S];console.warn("THREE.WebGLRenderer: Attempt to use non-existing WebGL internal format '"+S+"'")}let G=g;if(g===i.RED&&(O===i.FLOAT&&(G=i.R32F),O===i.HALF_FLOAT&&(G=i.R16F),O===i.UNSIGNED_BYTE&&(G=i.R8)),g===i.RED_INTEGER&&(O===i.UNSIGNED_BYTE&&(G=i.R8UI),O===i.UNSIGNED_SHORT&&(G=i.R16UI),O===i.UNSIGNED_INT&&(G=i.R32UI),O===i.BYTE&&(G=i.R8I),O===i.SHORT&&(G=i.R16I),O===i.INT&&(G=i.R32I)),g===i.RG&&(O===i.FLOAT&&(G=i.RG32F),O===i.HALF_FLOAT&&(G=i.RG16F),O===i.UNSIGNED_BYTE&&(G=i.RG8)),g===i.RG_INTEGER&&(O===i.UNSIGNED_BYTE&&(G=i.RG8UI),O===i.UNSIGNED_SHORT&&(G=i.RG16UI),O===i.UNSIGNED_INT&&(G=i.RG32UI),O===i.BYTE&&(G=i.RG8I),O===i.SHORT&&(G=i.RG16I),O===i.INT&&(G=i.RG32I)),g===i.RGB_INTEGER&&(O===i.UNSIGNED_BYTE&&(G=i.RGB8UI),O===i.UNSIGNED_SHORT&&(G=i.RGB16UI),O===i.UNSIGNED_INT&&(G=i.RGB32UI),O===i.BYTE&&(G=i.RGB8I),O===i.SHORT&&(G=i.RGB16I),O===i.INT&&(G=i.RGB32I)),g===i.RGBA_INTEGER&&(O===i.UNSIGNED_BYTE&&(G=i.RGBA8UI),O===i.UNSIGNED_SHORT&&(G=i.RGBA16UI),O===i.UNSIGNED_INT&&(G=i.RGBA32UI),O===i.BYTE&&(G=i.RGBA8I),O===i.SHORT&&(G=i.RGBA16I),O===i.INT&&(G=i.RGBA32I)),g===i.RGB&&(O===i.UNSIGNED_INT_5_9_9_9_REV&&(G=i.RGB9_E5),O===i.UNSIGNED_INT_10F_11F_11F_REV&&(G=i.R11F_G11F_B10F)),g===i.RGBA){let wt=K?Fs:$t.getTransfer(X);O===i.FLOAT&&(G=i.RGBA32F),O===i.HALF_FLOAT&&(G=i.RGBA16F),O===i.UNSIGNED_BYTE&&(G=wt===Kt?i.SRGB8_ALPHA8:i.RGBA8),O===i.UNSIGNED_SHORT_4_4_4_4&&(G=i.RGBA4),O===i.UNSIGNED_SHORT_5_5_5_1&&(G=i.RGB5_A1)}return(G===i.R16F||G===i.R32F||G===i.RG16F||G===i.RG32F||G===i.RGBA16F||G===i.RGBA32F)&&t.get("EXT_color_buffer_float"),G}function M(S,g){let O;return S?g===null||g===hi||g===ds?O=i.DEPTH24_STENCIL8:g===yn?O=i.DEPTH32F_STENCIL8:g===cs&&(O=i.DEPTH24_STENCIL8,console.warn("DepthTexture: 16 bit depth attachment is not supported with stencil. Using 24-bit attachment.")):g===null||g===hi||g===ds?O=i.DEPTH_COMPONENT24:g===yn?O=i.DEPTH_COMPONENT32F:g===cs&&(O=i.DEPTH_COMPONENT16),O}function P(S,g){return m(S)===!0||S.isFramebufferTexture&&S.minFilter!==We&&S.minFilter!==mn?Math.log2(Math.max(g.width,g.height))+1:S.mipmaps!==void 0&&S.mipmaps.length>0?S.mipmaps.length:S.isCompressedTexture&&Array.isArray(S.image)?g.mipmaps.length:1}function R(S){let g=S.target;g.removeEventListener("dispose",R),B(g),g.isVideoTexture&&u.delete(g)}function C(S){let g=S.target;g.removeEventListener("dispose",C),v(g)}function B(S){let g=n.get(S);if(g.__webglInit===void 0)return;let O=S.source,X=h.get(O);if(X){let K=X[g.__cacheKey];K.usedTimes--,K.usedTimes===0&&b(S),Object.keys(X).length===0&&h.delete(O)}n.remove(S)}function b(S){let g=n.get(S);i.deleteTexture(g.__webglTexture);let O=S.source,X=h.get(O);delete X[g.__cacheKey],a.memory.textures--}function v(S){let g=n.get(S);if(S.depthTexture&&(S.depthTexture.dispose(),n.remove(S.depthTexture)),S.isWebGLCubeRenderTarget)for(let X=0;X<6;X++){if(Array.isArray(g.__webglFramebuffer[X]))for(let K=0;K<g.__webglFramebuffer[X].length;K++)i.deleteFramebuffer(g.__webglFramebuffer[X][K]);else i.deleteFramebuffer(g.__webglFramebuffer[X]);g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer[X])}else{if(Array.isArray(g.__webglFramebuffer))for(let X=0;X<g.__webglFramebuffer.length;X++)i.deleteFramebuffer(g.__webglFramebuffer[X]);else i.deleteFramebuffer(g.__webglFramebuffer);if(g.__webglDepthbuffer&&i.deleteRenderbuffer(g.__webglDepthbuffer),g.__webglMultisampledFramebuffer&&i.deleteFramebuffer(g.__webglMultisampledFramebuffer),g.__webglColorRenderbuffer)for(let X=0;X<g.__webglColorRenderbuffer.length;X++)g.__webglColorRenderbuffer[X]&&i.deleteRenderbuffer(g.__webglColorRenderbuffer[X]);g.__webglDepthRenderbuffer&&i.deleteRenderbuffer(g.__webglDepthRenderbuffer)}let O=S.textures;for(let X=0,K=O.length;X<K;X++){let G=n.get(O[X]);G.__webglTexture&&(i.deleteTexture(G.__webglTexture),a.memory.textures--),n.remove(O[X])}n.remove(S)}let D=0;function V(){D=0}function W(){let S=D;return S>=s.maxTextures&&console.warn("THREE.WebGLTextures: Trying to use "+S+" texture units while this GPU supports only "+s.maxTextures),D+=1,S}function q(S){let g=[];return g.push(S.wrapS),g.push(S.wrapT),g.push(S.wrapR||0),g.push(S.magFilter),g.push(S.minFilter),g.push(S.anisotropy),g.push(S.internalFormat),g.push(S.format),g.push(S.type),g.push(S.generateMipmaps),g.push(S.premultiplyAlpha),g.push(S.flipY),g.push(S.unpackAlignment),g.push(S.colorSpace),g.join()}function J(S,g){let O=n.get(S);if(S.isVideoTexture&&zt(S),S.isRenderTargetTexture===!1&&S.isExternalTexture!==!0&&S.version>0&&O.__version!==S.version){let X=S.image;if(X===null)console.warn("THREE.WebGLRenderer: Texture marked for update but no image data found.");else if(X.complete===!1)console.warn("THREE.WebGLRenderer: Texture marked for update but image is incomplete");else{Y(O,S,g);return}}else S.isExternalTexture&&(O.__webglTexture=S.sourceTexture?S.sourceTexture:null);e.bindTexture(i.TEXTURE_2D,O.__webglTexture,i.TEXTURE0+g)}function $(S,g){let O=n.get(S);if(S.isRenderTargetTexture===!1&&S.version>0&&O.__version!==S.version){Y(O,S,g);return}e.bindTexture(i.TEXTURE_2D_ARRAY,O.__webglTexture,i.TEXTURE0+g)}function st(S,g){let O=n.get(S);if(S.isRenderTargetTexture===!1&&S.version>0&&O.__version!==S.version){Y(O,S,g);return}e.bindTexture(i.TEXTURE_3D,O.__webglTexture,i.TEXTURE0+g)}function H(S,g){let O=n.get(S);if(S.version>0&&O.__version!==S.version){j(O,S,g);return}e.bindTexture(i.TEXTURE_CUBE_MAP,O.__webglTexture,i.TEXTURE0+g)}let lt={[$r]:i.REPEAT,[ei]:i.CLAMP_TO_EDGE,[qr]:i.MIRRORED_REPEAT},pt={[We]:i.NEAREST,[Nh]:i.NEAREST_MIPMAP_NEAREST,[sr]:i.NEAREST_MIPMAP_LINEAR,[mn]:i.LINEAR,[Ca]:i.LINEAR_MIPMAP_NEAREST,[ci]:i.LINEAR_MIPMAP_LINEAR},Tt={[Bh]:i.NEVER,[Wh]:i.ALWAYS,[zh]:i.LESS,[Pl]:i.LEQUAL,[kh]:i.EQUAL,[Gh]:i.GEQUAL,[Vh]:i.GREATER,[Hh]:i.NOTEQUAL};function Gt(S,g){if(g.type===yn&&t.has("OES_texture_float_linear")===!1&&(g.magFilter===mn||g.magFilter===Ca||g.magFilter===sr||g.magFilter===ci||g.minFilter===mn||g.minFilter===Ca||g.minFilter===sr||g.minFilter===ci)&&console.warn("THREE.WebGLRenderer: Unable to use linear filtering with floating point textures. OES_texture_float_linear not supported on this device."),i.texParameteri(S,i.TEXTURE_WRAP_S,lt[g.wrapS]),i.texParameteri(S,i.TEXTURE_WRAP_T,lt[g.wrapT]),(S===i.TEXTURE_3D||S===i.TEXTURE_2D_ARRAY)&&i.texParameteri(S,i.TEXTURE_WRAP_R,lt[g.wrapR]),i.texParameteri(S,i.TEXTURE_MAG_FILTER,pt[g.magFilter]),i.texParameteri(S,i.TEXTURE_MIN_FILTER,pt[g.minFilter]),g.compareFunction&&(i.texParameteri(S,i.TEXTURE_COMPARE_MODE,i.COMPARE_REF_TO_TEXTURE),i.texParameteri(S,i.TEXTURE_COMPARE_FUNC,Tt[g.compareFunction])),t.has("EXT_texture_filter_anisotropic")===!0){if(g.magFilter===We||g.minFilter!==sr&&g.minFilter!==ci||g.type===yn&&t.has("OES_texture_float_linear")===!1)return;if(g.anisotropy>1||n.get(g).__currentAnisotropy){let O=t.get("EXT_texture_filter_anisotropic");i.texParameterf(S,O.TEXTURE_MAX_ANISOTROPY_EXT,Math.min(g.anisotropy,s.getMaxAnisotropy())),n.get(g).__currentAnisotropy=g.anisotropy}}}function ee(S,g){let O=!1;S.__webglInit===void 0&&(S.__webglInit=!0,g.addEventListener("dispose",R));let X=g.source,K=h.get(X);K===void 0&&(K={},h.set(X,K));let G=q(g);if(G!==S.__cacheKey){K[G]===void 0&&(K[G]={texture:i.createTexture(),usedTimes:0},a.memory.textures++,O=!0),K[G].usedTimes++;let wt=K[S.__cacheKey];wt!==void 0&&(K[S.__cacheKey].usedTimes--,wt.usedTimes===0&&b(g)),S.__cacheKey=G,S.__webglTexture=K[G].texture}return O}function re(S,g,O){return Math.floor(Math.floor(S/O)/g)}function Yt(S,g,O,X){let G=S.updateRanges;if(G.length===0)e.texSubImage2D(i.TEXTURE_2D,0,0,0,g.width,g.height,O,X,g.data);else{G.sort((nt,dt)=>nt.start-dt.start);let wt=0;for(let nt=1;nt<G.length;nt++){let dt=G[wt],Pt=G[nt],St=dt.start+dt.count,ct=re(Pt.start,g.width,4),Bt=re(dt.start,g.width,4);Pt.start<=St+1&&ct===Bt&&re(Pt.start+Pt.count-1,g.width,4)===ct?dt.count=Math.max(dt.count,Pt.start+Pt.count-dt.start):(++wt,G[wt]=Pt)}G.length=wt+1;let rt=i.getParameter(i.UNPACK_ROW_LENGTH),bt=i.getParameter(i.UNPACK_SKIP_PIXELS),Mt=i.getParameter(i.UNPACK_SKIP_ROWS);i.pixelStorei(i.UNPACK_ROW_LENGTH,g.width);for(let nt=0,dt=G.length;nt<dt;nt++){let Pt=G[nt],St=Math.floor(Pt.start/4),ct=Math.ceil(Pt.count/4),Bt=St%g.width,I=Math.floor(St/g.width),it=ct,at=1;i.pixelStorei(i.UNPACK_SKIP_PIXELS,Bt),i.pixelStorei(i.UNPACK_SKIP_ROWS,I),e.texSubImage2D(i.TEXTURE_2D,0,Bt,I,it,at,O,X,g.data)}S.clearUpdateRanges(),i.pixelStorei(i.UNPACK_ROW_LENGTH,rt),i.pixelStorei(i.UNPACK_SKIP_PIXELS,bt),i.pixelStorei(i.UNPACK_SKIP_ROWS,Mt)}}function Y(S,g,O){let X=i.TEXTURE_2D;(g.isDataArrayTexture||g.isCompressedArrayTexture)&&(X=i.TEXTURE_2D_ARRAY),g.isData3DTexture&&(X=i.TEXTURE_3D);let K=ee(S,g),G=g.source;e.bindTexture(X,S.__webglTexture,i.TEXTURE0+O);let wt=n.get(G);if(G.version!==wt.__version||K===!0){e.activeTexture(i.TEXTURE0+O);let rt=$t.getPrimaries($t.workingColorSpace),bt=g.colorSpace===Gn?null:$t.getPrimaries(g.colorSpace),Mt=g.colorSpace===Gn||rt===bt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,Mt);let nt=y(g.image,!1,s.maxTextureSize);nt=be(g,nt);let dt=r.convert(g.format,g.colorSpace),Pt=r.convert(g.type),St=E(g.internalFormat,dt,Pt,g.colorSpace,g.isVideoTexture);Gt(X,g);let ct,Bt=g.mipmaps,I=g.isVideoTexture!==!0,it=wt.__version===void 0||K===!0,at=G.dataReady,mt=P(g,nt);if(g.isDepthTexture)St=M(g.format===us,g.type),it&&(I?e.texStorage2D(i.TEXTURE_2D,1,St,nt.width,nt.height):e.texImage2D(i.TEXTURE_2D,0,St,nt.width,nt.height,0,dt,Pt,null));else if(g.isDataTexture)if(Bt.length>0){I&&it&&e.texStorage2D(i.TEXTURE_2D,mt,St,Bt[0].width,Bt[0].height);for(let Q=0,Z=Bt.length;Q<Z;Q++)ct=Bt[Q],I?at&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,ct.width,ct.height,dt,Pt,ct.data):e.texImage2D(i.TEXTURE_2D,Q,St,ct.width,ct.height,0,dt,Pt,ct.data);g.generateMipmaps=!1}else I?(it&&e.texStorage2D(i.TEXTURE_2D,mt,St,nt.width,nt.height),at&&Yt(g,nt,dt,Pt)):e.texImage2D(i.TEXTURE_2D,0,St,nt.width,nt.height,0,dt,Pt,nt.data);else if(g.isCompressedTexture)if(g.isCompressedArrayTexture){I&&it&&e.texStorage3D(i.TEXTURE_2D_ARRAY,mt,St,Bt[0].width,Bt[0].height,nt.depth);for(let Q=0,Z=Bt.length;Q<Z;Q++)if(ct=Bt[Q],g.format!==on)if(dt!==null)if(I){if(at)if(g.layerUpdates.size>0){let xt=Bl(ct.width,ct.height,g.format,g.type);for(let Ut of g.layerUpdates){let ne=ct.data.subarray(Ut*xt/ct.data.BYTES_PER_ELEMENT,(Ut+1)*xt/ct.data.BYTES_PER_ELEMENT);e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,Ut,ct.width,ct.height,1,dt,ne)}g.clearLayerUpdates()}else e.compressedTexSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ct.width,ct.height,nt.depth,dt,ct.data)}else e.compressedTexImage3D(i.TEXTURE_2D_ARRAY,Q,St,ct.width,ct.height,nt.depth,0,ct.data,0,0);else console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()");else I?at&&e.texSubImage3D(i.TEXTURE_2D_ARRAY,Q,0,0,0,ct.width,ct.height,nt.depth,dt,Pt,ct.data):e.texImage3D(i.TEXTURE_2D_ARRAY,Q,St,ct.width,ct.height,nt.depth,0,dt,Pt,ct.data)}else{I&&it&&e.texStorage2D(i.TEXTURE_2D,mt,St,Bt[0].width,Bt[0].height);for(let Q=0,Z=Bt.length;Q<Z;Q++)ct=Bt[Q],g.format!==on?dt!==null?I?at&&e.compressedTexSubImage2D(i.TEXTURE_2D,Q,0,0,ct.width,ct.height,dt,ct.data):e.compressedTexImage2D(i.TEXTURE_2D,Q,St,ct.width,ct.height,0,ct.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .uploadTexture()"):I?at&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,ct.width,ct.height,dt,Pt,ct.data):e.texImage2D(i.TEXTURE_2D,Q,St,ct.width,ct.height,0,dt,Pt,ct.data)}else if(g.isDataArrayTexture)if(I){if(it&&e.texStorage3D(i.TEXTURE_2D_ARRAY,mt,St,nt.width,nt.height,nt.depth),at)if(g.layerUpdates.size>0){let Q=Bl(nt.width,nt.height,g.format,g.type);for(let Z of g.layerUpdates){let xt=nt.data.subarray(Z*Q/nt.data.BYTES_PER_ELEMENT,(Z+1)*Q/nt.data.BYTES_PER_ELEMENT);e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,Z,nt.width,nt.height,1,dt,Pt,xt)}g.clearLayerUpdates()}else e.texSubImage3D(i.TEXTURE_2D_ARRAY,0,0,0,0,nt.width,nt.height,nt.depth,dt,Pt,nt.data)}else e.texImage3D(i.TEXTURE_2D_ARRAY,0,St,nt.width,nt.height,nt.depth,0,dt,Pt,nt.data);else if(g.isData3DTexture)I?(it&&e.texStorage3D(i.TEXTURE_3D,mt,St,nt.width,nt.height,nt.depth),at&&e.texSubImage3D(i.TEXTURE_3D,0,0,0,0,nt.width,nt.height,nt.depth,dt,Pt,nt.data)):e.texImage3D(i.TEXTURE_3D,0,St,nt.width,nt.height,nt.depth,0,dt,Pt,nt.data);else if(g.isFramebufferTexture){if(it)if(I)e.texStorage2D(i.TEXTURE_2D,mt,St,nt.width,nt.height);else{let Q=nt.width,Z=nt.height;for(let xt=0;xt<mt;xt++)e.texImage2D(i.TEXTURE_2D,xt,St,Q,Z,0,dt,Pt,null),Q>>=1,Z>>=1}}else if(Bt.length>0){if(I&&it){let Q=pe(Bt[0]);e.texStorage2D(i.TEXTURE_2D,mt,St,Q.width,Q.height)}for(let Q=0,Z=Bt.length;Q<Z;Q++)ct=Bt[Q],I?at&&e.texSubImage2D(i.TEXTURE_2D,Q,0,0,dt,Pt,ct):e.texImage2D(i.TEXTURE_2D,Q,St,dt,Pt,ct);g.generateMipmaps=!1}else if(I){if(it){let Q=pe(nt);e.texStorage2D(i.TEXTURE_2D,mt,St,Q.width,Q.height)}at&&e.texSubImage2D(i.TEXTURE_2D,0,0,0,dt,Pt,nt)}else e.texImage2D(i.TEXTURE_2D,0,St,dt,Pt,nt);m(g)&&p(X),wt.__version=G.version,g.onUpdate&&g.onUpdate(g)}S.__version=g.version}function j(S,g,O){if(g.image.length!==6)return;let X=ee(S,g),K=g.source;e.bindTexture(i.TEXTURE_CUBE_MAP,S.__webglTexture,i.TEXTURE0+O);let G=n.get(K);if(K.version!==G.__version||X===!0){e.activeTexture(i.TEXTURE0+O);let wt=$t.getPrimaries($t.workingColorSpace),rt=g.colorSpace===Gn?null:$t.getPrimaries(g.colorSpace),bt=g.colorSpace===Gn||wt===rt?i.NONE:i.BROWSER_DEFAULT_WEBGL;i.pixelStorei(i.UNPACK_FLIP_Y_WEBGL,g.flipY),i.pixelStorei(i.UNPACK_PREMULTIPLY_ALPHA_WEBGL,g.premultiplyAlpha),i.pixelStorei(i.UNPACK_ALIGNMENT,g.unpackAlignment),i.pixelStorei(i.UNPACK_COLORSPACE_CONVERSION_WEBGL,bt);let Mt=g.isCompressedTexture||g.image[0].isCompressedTexture,nt=g.image[0]&&g.image[0].isDataTexture,dt=[];for(let Z=0;Z<6;Z++)!Mt&&!nt?dt[Z]=y(g.image[Z],!0,s.maxCubemapSize):dt[Z]=nt?g.image[Z].image:g.image[Z],dt[Z]=be(g,dt[Z]);let Pt=dt[0],St=r.convert(g.format,g.colorSpace),ct=r.convert(g.type),Bt=E(g.internalFormat,St,ct,g.colorSpace),I=g.isVideoTexture!==!0,it=G.__version===void 0||X===!0,at=K.dataReady,mt=P(g,Pt);Gt(i.TEXTURE_CUBE_MAP,g);let Q;if(Mt){I&&it&&e.texStorage2D(i.TEXTURE_CUBE_MAP,mt,Bt,Pt.width,Pt.height);for(let Z=0;Z<6;Z++){Q=dt[Z].mipmaps;for(let xt=0;xt<Q.length;xt++){let Ut=Q[xt];g.format!==on?St!==null?I?at&&e.compressedTexSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,xt,0,0,Ut.width,Ut.height,St,Ut.data):e.compressedTexImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,xt,Bt,Ut.width,Ut.height,0,Ut.data):console.warn("THREE.WebGLRenderer: Attempt to load unsupported compressed texture format in .setTextureCube()"):I?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,xt,0,0,Ut.width,Ut.height,St,ct,Ut.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,xt,Bt,Ut.width,Ut.height,0,St,ct,Ut.data)}}}else{if(Q=g.mipmaps,I&&it){Q.length>0&&mt++;let Z=pe(dt[0]);e.texStorage2D(i.TEXTURE_CUBE_MAP,mt,Bt,Z.width,Z.height)}for(let Z=0;Z<6;Z++)if(nt){I?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,dt[Z].width,dt[Z].height,St,ct,dt[Z].data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Bt,dt[Z].width,dt[Z].height,0,St,ct,dt[Z].data);for(let xt=0;xt<Q.length;xt++){let ne=Q[xt].image[Z].image;I?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,xt+1,0,0,ne.width,ne.height,St,ct,ne.data):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,xt+1,Bt,ne.width,ne.height,0,St,ct,ne.data)}}else{I?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,0,0,St,ct,dt[Z]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,0,Bt,St,ct,dt[Z]);for(let xt=0;xt<Q.length;xt++){let Ut=Q[xt];I?at&&e.texSubImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,xt+1,0,0,St,ct,Ut.image[Z]):e.texImage2D(i.TEXTURE_CUBE_MAP_POSITIVE_X+Z,xt+1,Bt,St,ct,Ut.image[Z])}}}m(g)&&p(i.TEXTURE_CUBE_MAP),G.__version=K.version,g.onUpdate&&g.onUpdate(g)}S.__version=g.version}function gt(S,g,O,X,K,G){let wt=r.convert(O.format,O.colorSpace),rt=r.convert(O.type),bt=E(O.internalFormat,wt,rt,O.colorSpace),Mt=n.get(g),nt=n.get(O);if(nt.__renderTarget=g,!Mt.__hasExternalTextures){let dt=Math.max(1,g.width>>G),Pt=Math.max(1,g.height>>G);K===i.TEXTURE_3D||K===i.TEXTURE_2D_ARRAY?e.texImage3D(K,G,bt,dt,Pt,g.depth,0,wt,rt,null):e.texImage2D(K,G,bt,dt,Pt,0,wt,rt,null)}e.bindFramebuffer(i.FRAMEBUFFER,S),vt(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,X,K,nt.__webglTexture,0,oe(g)):(K===i.TEXTURE_2D||K>=i.TEXTURE_CUBE_MAP_POSITIVE_X&&K<=i.TEXTURE_CUBE_MAP_NEGATIVE_Z)&&i.framebufferTexture2D(i.FRAMEBUFFER,X,K,nt.__webglTexture,G),e.bindFramebuffer(i.FRAMEBUFFER,null)}function Nt(S,g,O){if(i.bindRenderbuffer(i.RENDERBUFFER,S),g.depthBuffer){let X=g.depthTexture,K=X&&X.isDepthTexture?X.type:null,G=M(g.stencilBuffer,K),wt=g.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,rt=oe(g);vt(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,rt,G,g.width,g.height):O?i.renderbufferStorageMultisample(i.RENDERBUFFER,rt,G,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,G,g.width,g.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,wt,i.RENDERBUFFER,S)}else{let X=g.textures;for(let K=0;K<X.length;K++){let G=X[K],wt=r.convert(G.format,G.colorSpace),rt=r.convert(G.type),bt=E(G.internalFormat,wt,rt,G.colorSpace),Mt=oe(g);O&&vt(g)===!1?i.renderbufferStorageMultisample(i.RENDERBUFFER,Mt,bt,g.width,g.height):vt(g)?o.renderbufferStorageMultisampleEXT(i.RENDERBUFFER,Mt,bt,g.width,g.height):i.renderbufferStorage(i.RENDERBUFFER,bt,g.width,g.height)}}i.bindRenderbuffer(i.RENDERBUFFER,null)}function Et(S,g){if(g&&g.isWebGLCubeRenderTarget)throw new Error("Depth Texture with cube render targets is not supported");if(e.bindFramebuffer(i.FRAMEBUFFER,S),!(g.depthTexture&&g.depthTexture.isDepthTexture))throw new Error("renderTarget.depthTexture must be an instance of THREE.DepthTexture");let X=n.get(g.depthTexture);X.__renderTarget=g,(!X.__webglTexture||g.depthTexture.image.width!==g.width||g.depthTexture.image.height!==g.height)&&(g.depthTexture.image.width=g.width,g.depthTexture.image.height=g.height,g.depthTexture.needsUpdate=!0),J(g.depthTexture,0);let K=X.__webglTexture,G=oe(g);if(g.depthTexture.format===ts)vt(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0,G):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_ATTACHMENT,i.TEXTURE_2D,K,0);else if(g.depthTexture.format===us)vt(g)?o.framebufferTexture2DMultisampleEXT(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0,G):i.framebufferTexture2D(i.FRAMEBUFFER,i.DEPTH_STENCIL_ATTACHMENT,i.TEXTURE_2D,K,0);else throw new Error("Unknown depthTexture format")}function Xt(S){let g=n.get(S),O=S.isWebGLCubeRenderTarget===!0;if(g.__boundDepthTexture!==S.depthTexture){let X=S.depthTexture;if(g.__depthDisposeCallback&&g.__depthDisposeCallback(),X){let K=()=>{delete g.__boundDepthTexture,delete g.__depthDisposeCallback,X.removeEventListener("dispose",K)};X.addEventListener("dispose",K),g.__depthDisposeCallback=K}g.__boundDepthTexture=X}if(S.depthTexture&&!g.__autoAllocateDepthBuffer){if(O)throw new Error("target.depthTexture not supported in Cube render targets");let X=S.texture.mipmaps;X&&X.length>0?Et(g.__webglFramebuffer[0],S):Et(g.__webglFramebuffer,S)}else if(O){g.__webglDepthbuffer=[];for(let X=0;X<6;X++)if(e.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[X]),g.__webglDepthbuffer[X]===void 0)g.__webglDepthbuffer[X]=i.createRenderbuffer(),Nt(g.__webglDepthbuffer[X],S,!1);else{let K=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,G=g.__webglDepthbuffer[X];i.bindRenderbuffer(i.RENDERBUFFER,G),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,G)}}else{let X=S.texture.mipmaps;if(X&&X.length>0?e.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer[0]):e.bindFramebuffer(i.FRAMEBUFFER,g.__webglFramebuffer),g.__webglDepthbuffer===void 0)g.__webglDepthbuffer=i.createRenderbuffer(),Nt(g.__webglDepthbuffer,S,!1);else{let K=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,G=g.__webglDepthbuffer;i.bindRenderbuffer(i.RENDERBUFFER,G),i.framebufferRenderbuffer(i.FRAMEBUFFER,K,i.RENDERBUFFER,G)}}e.bindFramebuffer(i.FRAMEBUFFER,null)}function Re(S,g,O){let X=n.get(S);g!==void 0&&gt(X.__webglFramebuffer,S,S.texture,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,0),O!==void 0&&Xt(S)}function T(S){let g=S.texture,O=n.get(S),X=n.get(g);S.addEventListener("dispose",C);let K=S.textures,G=S.isWebGLCubeRenderTarget===!0,wt=K.length>1;if(wt||(X.__webglTexture===void 0&&(X.__webglTexture=i.createTexture()),X.__version=g.version,a.memory.textures++),G){O.__webglFramebuffer=[];for(let rt=0;rt<6;rt++)if(g.mipmaps&&g.mipmaps.length>0){O.__webglFramebuffer[rt]=[];for(let bt=0;bt<g.mipmaps.length;bt++)O.__webglFramebuffer[rt][bt]=i.createFramebuffer()}else O.__webglFramebuffer[rt]=i.createFramebuffer()}else{if(g.mipmaps&&g.mipmaps.length>0){O.__webglFramebuffer=[];for(let rt=0;rt<g.mipmaps.length;rt++)O.__webglFramebuffer[rt]=i.createFramebuffer()}else O.__webglFramebuffer=i.createFramebuffer();if(wt)for(let rt=0,bt=K.length;rt<bt;rt++){let Mt=n.get(K[rt]);Mt.__webglTexture===void 0&&(Mt.__webglTexture=i.createTexture(),a.memory.textures++)}if(S.samples>0&&vt(S)===!1){O.__webglMultisampledFramebuffer=i.createFramebuffer(),O.__webglColorRenderbuffer=[],e.bindFramebuffer(i.FRAMEBUFFER,O.__webglMultisampledFramebuffer);for(let rt=0;rt<K.length;rt++){let bt=K[rt];O.__webglColorRenderbuffer[rt]=i.createRenderbuffer(),i.bindRenderbuffer(i.RENDERBUFFER,O.__webglColorRenderbuffer[rt]);let Mt=r.convert(bt.format,bt.colorSpace),nt=r.convert(bt.type),dt=E(bt.internalFormat,Mt,nt,bt.colorSpace,S.isXRRenderTarget===!0),Pt=oe(S);i.renderbufferStorageMultisample(i.RENDERBUFFER,Pt,dt,S.width,S.height),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+rt,i.RENDERBUFFER,O.__webglColorRenderbuffer[rt])}i.bindRenderbuffer(i.RENDERBUFFER,null),S.depthBuffer&&(O.__webglDepthRenderbuffer=i.createRenderbuffer(),Nt(O.__webglDepthRenderbuffer,S,!0)),e.bindFramebuffer(i.FRAMEBUFFER,null)}}if(G){e.bindTexture(i.TEXTURE_CUBE_MAP,X.__webglTexture),Gt(i.TEXTURE_CUBE_MAP,g);for(let rt=0;rt<6;rt++)if(g.mipmaps&&g.mipmaps.length>0)for(let bt=0;bt<g.mipmaps.length;bt++)gt(O.__webglFramebuffer[rt][bt],S,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+rt,bt);else gt(O.__webglFramebuffer[rt],S,g,i.COLOR_ATTACHMENT0,i.TEXTURE_CUBE_MAP_POSITIVE_X+rt,0);m(g)&&p(i.TEXTURE_CUBE_MAP),e.unbindTexture()}else if(wt){for(let rt=0,bt=K.length;rt<bt;rt++){let Mt=K[rt],nt=n.get(Mt),dt=i.TEXTURE_2D;(S.isWebGL3DRenderTarget||S.isWebGLArrayRenderTarget)&&(dt=S.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(dt,nt.__webglTexture),Gt(dt,Mt),gt(O.__webglFramebuffer,S,Mt,i.COLOR_ATTACHMENT0+rt,dt,0),m(Mt)&&p(dt)}e.unbindTexture()}else{let rt=i.TEXTURE_2D;if((S.isWebGL3DRenderTarget||S.isWebGLArrayRenderTarget)&&(rt=S.isWebGL3DRenderTarget?i.TEXTURE_3D:i.TEXTURE_2D_ARRAY),e.bindTexture(rt,X.__webglTexture),Gt(rt,g),g.mipmaps&&g.mipmaps.length>0)for(let bt=0;bt<g.mipmaps.length;bt++)gt(O.__webglFramebuffer[bt],S,g,i.COLOR_ATTACHMENT0,rt,bt);else gt(O.__webglFramebuffer,S,g,i.COLOR_ATTACHMENT0,rt,0);m(g)&&p(rt),e.unbindTexture()}S.depthBuffer&&Xt(S)}function ae(S){let g=S.textures;for(let O=0,X=g.length;O<X;O++){let K=g[O];if(m(K)){let G=w(S),wt=n.get(K).__webglTexture;e.bindTexture(G,wt),p(G),e.unbindTexture()}}}let Ft=[],It=[];function yt(S){if(S.samples>0){if(vt(S)===!1){let g=S.textures,O=S.width,X=S.height,K=i.COLOR_BUFFER_BIT,G=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT,wt=n.get(S),rt=g.length>1;if(rt)for(let Mt=0;Mt<g.length;Mt++)e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.RENDERBUFFER,null),e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.TEXTURE_2D,null,0);e.bindFramebuffer(i.READ_FRAMEBUFFER,wt.__webglMultisampledFramebuffer);let bt=S.texture.mipmaps;bt&&bt.length>0?e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglFramebuffer[0]):e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglFramebuffer);for(let Mt=0;Mt<g.length;Mt++){if(S.resolveDepthBuffer&&(S.depthBuffer&&(K|=i.DEPTH_BUFFER_BIT),S.stencilBuffer&&S.resolveStencilBuffer&&(K|=i.STENCIL_BUFFER_BIT)),rt){i.framebufferRenderbuffer(i.READ_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.RENDERBUFFER,wt.__webglColorRenderbuffer[Mt]);let nt=n.get(g[Mt]).__webglTexture;i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0,i.TEXTURE_2D,nt,0)}i.blitFramebuffer(0,0,O,X,0,0,O,X,K,i.NEAREST),l===!0&&(Ft.length=0,It.length=0,Ft.push(i.COLOR_ATTACHMENT0+Mt),S.depthBuffer&&S.resolveDepthBuffer===!1&&(Ft.push(G),It.push(G),i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,It)),i.invalidateFramebuffer(i.READ_FRAMEBUFFER,Ft))}if(e.bindFramebuffer(i.READ_FRAMEBUFFER,null),e.bindFramebuffer(i.DRAW_FRAMEBUFFER,null),rt)for(let Mt=0;Mt<g.length;Mt++){e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglMultisampledFramebuffer),i.framebufferRenderbuffer(i.FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.RENDERBUFFER,wt.__webglColorRenderbuffer[Mt]);let nt=n.get(g[Mt]).__webglTexture;e.bindFramebuffer(i.FRAMEBUFFER,wt.__webglFramebuffer),i.framebufferTexture2D(i.DRAW_FRAMEBUFFER,i.COLOR_ATTACHMENT0+Mt,i.TEXTURE_2D,nt,0)}e.bindFramebuffer(i.DRAW_FRAMEBUFFER,wt.__webglMultisampledFramebuffer)}else if(S.depthBuffer&&S.resolveDepthBuffer===!1&&l){let g=S.stencilBuffer?i.DEPTH_STENCIL_ATTACHMENT:i.DEPTH_ATTACHMENT;i.invalidateFramebuffer(i.DRAW_FRAMEBUFFER,[g])}}}function oe(S){return Math.min(s.maxSamples,S.samples)}function vt(S){let g=n.get(S);return S.samples>0&&t.has("WEBGL_multisampled_render_to_texture")===!0&&g.__useRenderToTexture!==!1}function zt(S){let g=a.render.frame;u.get(S)!==g&&(u.set(S,g),S.update())}function be(S,g){let O=S.colorSpace,X=S.format,K=S.type;return S.isCompressedTexture===!0||S.isVideoTexture===!0||O!==Mi&&O!==Gn&&($t.getTransfer(O)===Kt?(X!==on||K!==xn)&&console.warn("THREE.WebGLTextures: sRGB encoded textures have to use RGBAFormat and UnsignedByteType."):console.error("THREE.WebGLTextures: Unsupported texture color space:",O)),g}function pe(S){return typeof HTMLImageElement<"u"&&S instanceof HTMLImageElement?(c.width=S.naturalWidth||S.width,c.height=S.naturalHeight||S.height):typeof VideoFrame<"u"&&S instanceof VideoFrame?(c.width=S.displayWidth,c.height=S.displayHeight):(c.width=S.width,c.height=S.height),c}this.allocateTextureUnit=W,this.resetTextureUnits=V,this.setTexture2D=J,this.setTexture2DArray=$,this.setTexture3D=st,this.setTextureCube=H,this.rebindTextures=Re,this.setupRenderTarget=T,this.updateRenderTargetMipmap=ae,this.updateMultisampleRenderTarget=yt,this.setupDepthRenderbuffer=Xt,this.setupFrameBufferTexture=gt,this.useMultisampledRTT=vt}function b_(i,t){function e(n,s=Gn){let r,a=$t.getTransfer(s);if(n===xn)return i.UNSIGNED_BYTE;if(n===Pa)return i.UNSIGNED_SHORT_4_4_4_4;if(n===Ia)return i.UNSIGNED_SHORT_5_5_5_1;if(n===wl)return i.UNSIGNED_INT_5_9_9_9_REV;if(n===El)return i.UNSIGNED_INT_10F_11F_11F_REV;if(n===Ml)return i.BYTE;if(n===Sl)return i.SHORT;if(n===cs)return i.UNSIGNED_SHORT;if(n===Ra)return i.INT;if(n===hi)return i.UNSIGNED_INT;if(n===yn)return i.FLOAT;if(n===hs)return i.HALF_FLOAT;if(n===Tl)return i.ALPHA;if(n===Al)return i.RGB;if(n===on)return i.RGBA;if(n===ts)return i.DEPTH_COMPONENT;if(n===us)return i.DEPTH_STENCIL;if(n===La)return i.RED;if(n===Da)return i.RED_INTEGER;if(n===Cl)return i.RG;if(n===Na)return i.RG_INTEGER;if(n===Ua)return i.RGBA_INTEGER;if(n===rr||n===ar||n===or||n===lr)if(a===Kt)if(r=t.get("WEBGL_compressed_texture_s3tc_srgb"),r!==null){if(n===rr)return r.COMPRESSED_SRGB_S3TC_DXT1_EXT;if(n===ar)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT1_EXT;if(n===or)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT3_EXT;if(n===lr)return r.COMPRESSED_SRGB_ALPHA_S3TC_DXT5_EXT}else return null;else if(r=t.get("WEBGL_compressed_texture_s3tc"),r!==null){if(n===rr)return r.COMPRESSED_RGB_S3TC_DXT1_EXT;if(n===ar)return r.COMPRESSED_RGBA_S3TC_DXT1_EXT;if(n===or)return r.COMPRESSED_RGBA_S3TC_DXT3_EXT;if(n===lr)return r.COMPRESSED_RGBA_S3TC_DXT5_EXT}else return null;if(n===Fa||n===Oa||n===Ba||n===za)if(r=t.get("WEBGL_compressed_texture_pvrtc"),r!==null){if(n===Fa)return r.COMPRESSED_RGB_PVRTC_4BPPV1_IMG;if(n===Oa)return r.COMPRESSED_RGB_PVRTC_2BPPV1_IMG;if(n===Ba)return r.COMPRESSED_RGBA_PVRTC_4BPPV1_IMG;if(n===za)return r.COMPRESSED_RGBA_PVRTC_2BPPV1_IMG}else return null;if(n===ka||n===Va||n===Ha)if(r=t.get("WEBGL_compressed_texture_etc"),r!==null){if(n===ka||n===Va)return a===Kt?r.COMPRESSED_SRGB8_ETC2:r.COMPRESSED_RGB8_ETC2;if(n===Ha)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ETC2_EAC:r.COMPRESSED_RGBA8_ETC2_EAC}else return null;if(n===Ga||n===Wa||n===Xa||n===$a||n===qa||n===Ya||n===Za||n===Ja||n===Ka||n===ja||n===Qa||n===to||n===eo||n===no)if(r=t.get("WEBGL_compressed_texture_astc"),r!==null){if(n===Ga)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_4x4_KHR:r.COMPRESSED_RGBA_ASTC_4x4_KHR;if(n===Wa)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x4_KHR:r.COMPRESSED_RGBA_ASTC_5x4_KHR;if(n===Xa)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_5x5_KHR:r.COMPRESSED_RGBA_ASTC_5x5_KHR;if(n===$a)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x5_KHR:r.COMPRESSED_RGBA_ASTC_6x5_KHR;if(n===qa)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_6x6_KHR:r.COMPRESSED_RGBA_ASTC_6x6_KHR;if(n===Ya)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x5_KHR:r.COMPRESSED_RGBA_ASTC_8x5_KHR;if(n===Za)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x6_KHR:r.COMPRESSED_RGBA_ASTC_8x6_KHR;if(n===Ja)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_8x8_KHR:r.COMPRESSED_RGBA_ASTC_8x8_KHR;if(n===Ka)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x5_KHR:r.COMPRESSED_RGBA_ASTC_10x5_KHR;if(n===ja)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x6_KHR:r.COMPRESSED_RGBA_ASTC_10x6_KHR;if(n===Qa)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x8_KHR:r.COMPRESSED_RGBA_ASTC_10x8_KHR;if(n===to)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_10x10_KHR:r.COMPRESSED_RGBA_ASTC_10x10_KHR;if(n===eo)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x10_KHR:r.COMPRESSED_RGBA_ASTC_12x10_KHR;if(n===no)return a===Kt?r.COMPRESSED_SRGB8_ALPHA8_ASTC_12x12_KHR:r.COMPRESSED_RGBA_ASTC_12x12_KHR}else return null;if(n===io||n===so||n===ro)if(r=t.get("EXT_texture_compression_bptc"),r!==null){if(n===io)return a===Kt?r.COMPRESSED_SRGB_ALPHA_BPTC_UNORM_EXT:r.COMPRESSED_RGBA_BPTC_UNORM_EXT;if(n===so)return r.COMPRESSED_RGB_BPTC_SIGNED_FLOAT_EXT;if(n===ro)return r.COMPRESSED_RGB_BPTC_UNSIGNED_FLOAT_EXT}else return null;if(n===ao||n===oo||n===lo||n===co)if(r=t.get("EXT_texture_compression_rgtc"),r!==null){if(n===ao)return r.COMPRESSED_RED_RGTC1_EXT;if(n===oo)return r.COMPRESSED_SIGNED_RED_RGTC1_EXT;if(n===lo)return r.COMPRESSED_RED_GREEN_RGTC2_EXT;if(n===co)return r.COMPRESSED_SIGNED_RED_GREEN_RGTC2_EXT}else return null;return n===ds?i.UNSIGNED_INT_24_8:i[n]!==void 0?i[n]:null}return{convert:e}}var M_=`
void main() {

	gl_Position = vec4( position, 1.0 );

}`,S_=`
uniform sampler2DArray depthColor;
uniform float depthWidth;
uniform float depthHeight;

void main() {

	vec2 coord = vec2( gl_FragCoord.x / depthWidth, gl_FragCoord.y / depthHeight );

	if ( coord.x >= 1.0 ) {

		gl_FragDepth = texture( depthColor, vec3( coord.x - 1.0, coord.y, 1 ) ).r;

	} else {

		gl_FragDepth = texture( depthColor, vec3( coord.x, coord.y, 0 ) ).r;

	}

}`,Kl=class{constructor(){this.texture=null,this.mesh=null,this.depthNear=0,this.depthFar=0}init(t,e){if(this.texture===null){let n=new Zs(t.texture);(t.depthNear!==e.depthNear||t.depthFar!==e.depthFar)&&(this.depthNear=t.depthNear,this.depthFar=t.depthFar),this.texture=n}}getMesh(t){if(this.texture!==null&&this.mesh===null){let e=t.cameras[0].viewport,n=new _n({vertexShader:M_,fragmentShader:S_,uniforms:{depthColor:{value:this.texture},depthWidth:{value:e.z},depthHeight:{value:e.w}}});this.mesh=new Te(new wi(20,20),n)}return this.mesh}reset(){this.texture=null,this.mesh=null}getDepthTexture(){return this.texture}},jl=class extends wn{constructor(t,e){super();let n=this,s=null,r=1,a=null,o="local-floor",l=1,c=null,u=null,d=null,h=null,f=null,_=null,y=typeof XRWebGLBinding<"u",m=new Kl,p={},w=e.getContextAttributes(),E=null,M=null,P=[],R=[],C=new Dt,B=null,b=new Ne;b.viewport=new de;let v=new Ne;v.viewport=new de;let D=[b,v],V=new ga,W=null,q=null;this.cameraAutoUpdate=!0,this.enabled=!1,this.isPresenting=!1,this.getController=function(Y){let j=P[Y];return j===void 0&&(j=new as,P[Y]=j),j.getTargetRaySpace()},this.getControllerGrip=function(Y){let j=P[Y];return j===void 0&&(j=new as,P[Y]=j),j.getGripSpace()},this.getHand=function(Y){let j=P[Y];return j===void 0&&(j=new as,P[Y]=j),j.getHandSpace()};function J(Y){let j=R.indexOf(Y.inputSource);if(j===-1)return;let gt=P[j];gt!==void 0&&(gt.update(Y.inputSource,Y.frame,c||a),gt.dispatchEvent({type:Y.type,data:Y.inputSource}))}function $(){s.removeEventListener("select",J),s.removeEventListener("selectstart",J),s.removeEventListener("selectend",J),s.removeEventListener("squeeze",J),s.removeEventListener("squeezestart",J),s.removeEventListener("squeezeend",J),s.removeEventListener("end",$),s.removeEventListener("inputsourceschange",st);for(let Y=0;Y<P.length;Y++){let j=R[Y];j!==null&&(R[Y]=null,P[Y].disconnect(j))}W=null,q=null,m.reset();for(let Y in p)delete p[Y];t.setRenderTarget(E),f=null,h=null,d=null,s=null,M=null,Yt.stop(),n.isPresenting=!1,t.setPixelRatio(B),t.setSize(C.width,C.height,!1),n.dispatchEvent({type:"sessionend"})}this.setFramebufferScaleFactor=function(Y){r=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change framebuffer scale while presenting.")},this.setReferenceSpaceType=function(Y){o=Y,n.isPresenting===!0&&console.warn("THREE.WebXRManager: Cannot change reference space type while presenting.")},this.getReferenceSpace=function(){return c||a},this.setReferenceSpace=function(Y){c=Y},this.getBaseLayer=function(){return h!==null?h:f},this.getBinding=function(){return d===null&&y&&(d=new XRWebGLBinding(s,e)),d},this.getFrame=function(){return _},this.getSession=function(){return s},this.setSession=async function(Y){if(s=Y,s!==null){if(E=t.getRenderTarget(),s.addEventListener("select",J),s.addEventListener("selectstart",J),s.addEventListener("selectend",J),s.addEventListener("squeeze",J),s.addEventListener("squeezestart",J),s.addEventListener("squeezeend",J),s.addEventListener("end",$),s.addEventListener("inputsourceschange",st),w.xrCompatible!==!0&&await e.makeXRCompatible(),B=t.getPixelRatio(),t.getSize(C),y&&"createProjectionLayer"in XRWebGLBinding.prototype){let gt=null,Nt=null,Et=null;w.depth&&(Et=w.stencil?e.DEPTH24_STENCIL8:e.DEPTH_COMPONENT24,gt=w.stencil?us:ts,Nt=w.stencil?ds:hi);let Xt={colorFormat:e.RGBA8,depthFormat:Et,scaleFactor:r};d=this.getBinding(),h=d.createProjectionLayer(Xt),s.updateRenderState({layers:[h]}),t.setPixelRatio(1),t.setSize(h.textureWidth,h.textureHeight,!1),M=new En(h.textureWidth,h.textureHeight,{format:on,type:xn,depthTexture:new Ys(h.textureWidth,h.textureHeight,Nt,void 0,void 0,void 0,void 0,void 0,void 0,gt),stencilBuffer:w.stencil,colorSpace:t.outputColorSpace,samples:w.antialias?4:0,resolveDepthBuffer:h.ignoreDepthValues===!1,resolveStencilBuffer:h.ignoreDepthValues===!1})}else{let gt={antialias:w.antialias,alpha:!0,depth:w.depth,stencil:w.stencil,framebufferScaleFactor:r};f=new XRWebGLLayer(s,e,gt),s.updateRenderState({baseLayer:f}),t.setPixelRatio(1),t.setSize(f.framebufferWidth,f.framebufferHeight,!1),M=new En(f.framebufferWidth,f.framebufferHeight,{format:on,type:xn,colorSpace:t.outputColorSpace,stencilBuffer:w.stencil,resolveDepthBuffer:f.ignoreDepthValues===!1,resolveStencilBuffer:f.ignoreDepthValues===!1})}M.isXRRenderTarget=!0,this.setFoveation(l),c=null,a=await s.requestReferenceSpace(o),Yt.setContext(s),Yt.start(),n.isPresenting=!0,n.dispatchEvent({type:"sessionstart"})}},this.getEnvironmentBlendMode=function(){if(s!==null)return s.environmentBlendMode},this.getDepthTexture=function(){return m.getDepthTexture()};function st(Y){for(let j=0;j<Y.removed.length;j++){let gt=Y.removed[j],Nt=R.indexOf(gt);Nt>=0&&(R[Nt]=null,P[Nt].disconnect(gt))}for(let j=0;j<Y.added.length;j++){let gt=Y.added[j],Nt=R.indexOf(gt);if(Nt===-1){for(let Xt=0;Xt<P.length;Xt++)if(Xt>=R.length){R.push(gt),Nt=Xt;break}else if(R[Xt]===null){R[Xt]=gt,Nt=Xt;break}if(Nt===-1)break}let Et=P[Nt];Et&&Et.connect(gt)}}let H=new L,lt=new L;function pt(Y,j,gt){H.setFromMatrixPosition(j.matrixWorld),lt.setFromMatrixPosition(gt.matrixWorld);let Nt=H.distanceTo(lt),Et=j.projectionMatrix.elements,Xt=gt.projectionMatrix.elements,Re=Et[14]/(Et[10]-1),T=Et[14]/(Et[10]+1),ae=(Et[9]+1)/Et[5],Ft=(Et[9]-1)/Et[5],It=(Et[8]-1)/Et[0],yt=(Xt[8]+1)/Xt[0],oe=Re*It,vt=Re*yt,zt=Nt/(-It+yt),be=zt*-It;if(j.matrixWorld.decompose(Y.position,Y.quaternion,Y.scale),Y.translateX(be),Y.translateZ(zt),Y.matrixWorld.compose(Y.position,Y.quaternion,Y.scale),Y.matrixWorldInverse.copy(Y.matrixWorld).invert(),Et[10]===-1)Y.projectionMatrix.copy(j.projectionMatrix),Y.projectionMatrixInverse.copy(j.projectionMatrixInverse);else{let pe=Re+zt,S=T+zt,g=oe-be,O=vt+(Nt-be),X=ae*T/S*pe,K=Ft*T/S*pe;Y.projectionMatrix.makePerspective(g,O,X,K,pe,S),Y.projectionMatrixInverse.copy(Y.projectionMatrix).invert()}}function Tt(Y,j){j===null?Y.matrixWorld.copy(Y.matrix):Y.matrixWorld.multiplyMatrices(j.matrixWorld,Y.matrix),Y.matrixWorldInverse.copy(Y.matrixWorld).invert()}this.updateCamera=function(Y){if(s===null)return;let j=Y.near,gt=Y.far;m.texture!==null&&(m.depthNear>0&&(j=m.depthNear),m.depthFar>0&&(gt=m.depthFar)),V.near=v.near=b.near=j,V.far=v.far=b.far=gt,(W!==V.near||q!==V.far)&&(s.updateRenderState({depthNear:V.near,depthFar:V.far}),W=V.near,q=V.far),V.layers.mask=Y.layers.mask|6,b.layers.mask=V.layers.mask&3,v.layers.mask=V.layers.mask&5;let Nt=Y.parent,Et=V.cameras;Tt(V,Nt);for(let Xt=0;Xt<Et.length;Xt++)Tt(Et[Xt],Nt);Et.length===2?pt(V,b,v):V.projectionMatrix.copy(b.projectionMatrix),Gt(Y,V,Nt)};function Gt(Y,j,gt){gt===null?Y.matrix.copy(j.matrixWorld):(Y.matrix.copy(gt.matrixWorld),Y.matrix.invert(),Y.matrix.multiply(j.matrixWorld)),Y.matrix.decompose(Y.position,Y.quaternion,Y.scale),Y.updateMatrixWorld(!0),Y.projectionMatrix.copy(j.projectionMatrix),Y.projectionMatrixInverse.copy(j.projectionMatrixInverse),Y.isPerspectiveCamera&&(Y.fov=es*2*Math.atan(1/Y.projectionMatrix.elements[5]),Y.zoom=1)}this.getCamera=function(){return V},this.getFoveation=function(){if(!(h===null&&f===null))return l},this.setFoveation=function(Y){l=Y,h!==null&&(h.fixedFoveation=Y),f!==null&&f.fixedFoveation!==void 0&&(f.fixedFoveation=Y)},this.hasDepthSensing=function(){return m.texture!==null},this.getDepthSensingMesh=function(){return m.getMesh(V)},this.getCameraTexture=function(Y){return p[Y]};let ee=null;function re(Y,j){if(u=j.getViewerPose(c||a),_=j,u!==null){let gt=u.views;f!==null&&(t.setRenderTargetFramebuffer(M,f.framebuffer),t.setRenderTarget(M));let Nt=!1;gt.length!==V.cameras.length&&(V.cameras.length=0,Nt=!0);for(let T=0;T<gt.length;T++){let ae=gt[T],Ft=null;if(f!==null)Ft=f.getViewport(ae);else{let yt=d.getViewSubImage(h,ae);Ft=yt.viewport,T===0&&(t.setRenderTargetTextures(M,yt.colorTexture,yt.depthStencilTexture),t.setRenderTarget(M))}let It=D[T];It===void 0&&(It=new Ne,It.layers.enable(T),It.viewport=new de,D[T]=It),It.matrix.fromArray(ae.transform.matrix),It.matrix.decompose(It.position,It.quaternion,It.scale),It.projectionMatrix.fromArray(ae.projectionMatrix),It.projectionMatrixInverse.copy(It.projectionMatrix).invert(),It.viewport.set(Ft.x,Ft.y,Ft.width,Ft.height),T===0&&(V.matrix.copy(It.matrix),V.matrix.decompose(V.position,V.quaternion,V.scale)),Nt===!0&&V.cameras.push(It)}let Et=s.enabledFeatures;if(Et&&Et.includes("depth-sensing")&&s.depthUsage=="gpu-optimized"&&y){d=n.getBinding();let T=d.getDepthInformation(gt[0]);T&&T.isValid&&T.texture&&m.init(T,s.renderState)}if(Et&&Et.includes("camera-access")&&y){t.state.unbindTexture(),d=n.getBinding();for(let T=0;T<gt.length;T++){let ae=gt[T].camera;if(ae){let Ft=p[ae];Ft||(Ft=new Zs,p[ae]=Ft);let It=d.getCameraImage(ae);Ft.sourceTexture=It}}}}for(let gt=0;gt<P.length;gt++){let Nt=R[gt],Et=P[gt];Nt!==null&&Et!==void 0&&Et.update(Nt,j,c||a)}ee&&ee(Y,j),j.detectedPlanes&&n.dispatchEvent({type:"planesdetected",data:j}),_=null}let Yt=new yd;Yt.setAnimationLoop(re),this.setAnimationLoop=function(Y){ee=Y},this.dispose=function(){}}},Ii=new gn,w_=new Jt;function E_(i,t){function e(m,p){m.matrixAutoUpdate===!0&&m.updateMatrix(),p.value.copy(m.matrix)}function n(m,p){p.color.getRGB(m.fogColor.value,Ul(i)),p.isFog?(m.fogNear.value=p.near,m.fogFar.value=p.far):p.isFogExp2&&(m.fogDensity.value=p.density)}function s(m,p,w,E,M){p.isMeshBasicMaterial||p.isMeshLambertMaterial?r(m,p):p.isMeshToonMaterial?(r(m,p),d(m,p)):p.isMeshPhongMaterial?(r(m,p),u(m,p)):p.isMeshStandardMaterial?(r(m,p),h(m,p),p.isMeshPhysicalMaterial&&f(m,p,M)):p.isMeshMatcapMaterial?(r(m,p),_(m,p)):p.isMeshDepthMaterial?r(m,p):p.isMeshDistanceMaterial?(r(m,p),y(m,p)):p.isMeshNormalMaterial?r(m,p):p.isLineBasicMaterial?(a(m,p),p.isLineDashedMaterial&&o(m,p)):p.isPointsMaterial?l(m,p,w,E):p.isSpriteMaterial?c(m,p):p.isShadowMaterial?(m.color.value.copy(p.color),m.opacity.value=p.opacity):p.isShaderMaterial&&(p.uniformsNeedUpdate=!1)}function r(m,p){m.opacity.value=p.opacity,p.color&&m.diffuse.value.copy(p.color),p.emissive&&m.emissive.value.copy(p.emissive).multiplyScalar(p.emissiveIntensity),p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.bumpMap&&(m.bumpMap.value=p.bumpMap,e(p.bumpMap,m.bumpMapTransform),m.bumpScale.value=p.bumpScale,p.side===ke&&(m.bumpScale.value*=-1)),p.normalMap&&(m.normalMap.value=p.normalMap,e(p.normalMap,m.normalMapTransform),m.normalScale.value.copy(p.normalScale),p.side===ke&&m.normalScale.value.negate()),p.displacementMap&&(m.displacementMap.value=p.displacementMap,e(p.displacementMap,m.displacementMapTransform),m.displacementScale.value=p.displacementScale,m.displacementBias.value=p.displacementBias),p.emissiveMap&&(m.emissiveMap.value=p.emissiveMap,e(p.emissiveMap,m.emissiveMapTransform)),p.specularMap&&(m.specularMap.value=p.specularMap,e(p.specularMap,m.specularMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest);let w=t.get(p),E=w.envMap,M=w.envMapRotation;E&&(m.envMap.value=E,Ii.copy(M),Ii.x*=-1,Ii.y*=-1,Ii.z*=-1,E.isCubeTexture&&E.isRenderTargetTexture===!1&&(Ii.y*=-1,Ii.z*=-1),m.envMapRotation.value.setFromMatrix4(w_.makeRotationFromEuler(Ii)),m.flipEnvMap.value=E.isCubeTexture&&E.isRenderTargetTexture===!1?-1:1,m.reflectivity.value=p.reflectivity,m.ior.value=p.ior,m.refractionRatio.value=p.refractionRatio),p.lightMap&&(m.lightMap.value=p.lightMap,m.lightMapIntensity.value=p.lightMapIntensity,e(p.lightMap,m.lightMapTransform)),p.aoMap&&(m.aoMap.value=p.aoMap,m.aoMapIntensity.value=p.aoMapIntensity,e(p.aoMap,m.aoMapTransform))}function a(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform))}function o(m,p){m.dashSize.value=p.dashSize,m.totalSize.value=p.dashSize+p.gapSize,m.scale.value=p.scale}function l(m,p,w,E){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.size.value=p.size*w,m.scale.value=E*.5,p.map&&(m.map.value=p.map,e(p.map,m.uvTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function c(m,p){m.diffuse.value.copy(p.color),m.opacity.value=p.opacity,m.rotation.value=p.rotation,p.map&&(m.map.value=p.map,e(p.map,m.mapTransform)),p.alphaMap&&(m.alphaMap.value=p.alphaMap,e(p.alphaMap,m.alphaMapTransform)),p.alphaTest>0&&(m.alphaTest.value=p.alphaTest)}function u(m,p){m.specular.value.copy(p.specular),m.shininess.value=Math.max(p.shininess,1e-4)}function d(m,p){p.gradientMap&&(m.gradientMap.value=p.gradientMap)}function h(m,p){m.metalness.value=p.metalness,p.metalnessMap&&(m.metalnessMap.value=p.metalnessMap,e(p.metalnessMap,m.metalnessMapTransform)),m.roughness.value=p.roughness,p.roughnessMap&&(m.roughnessMap.value=p.roughnessMap,e(p.roughnessMap,m.roughnessMapTransform)),p.envMap&&(m.envMapIntensity.value=p.envMapIntensity)}function f(m,p,w){m.ior.value=p.ior,p.sheen>0&&(m.sheenColor.value.copy(p.sheenColor).multiplyScalar(p.sheen),m.sheenRoughness.value=p.sheenRoughness,p.sheenColorMap&&(m.sheenColorMap.value=p.sheenColorMap,e(p.sheenColorMap,m.sheenColorMapTransform)),p.sheenRoughnessMap&&(m.sheenRoughnessMap.value=p.sheenRoughnessMap,e(p.sheenRoughnessMap,m.sheenRoughnessMapTransform))),p.clearcoat>0&&(m.clearcoat.value=p.clearcoat,m.clearcoatRoughness.value=p.clearcoatRoughness,p.clearcoatMap&&(m.clearcoatMap.value=p.clearcoatMap,e(p.clearcoatMap,m.clearcoatMapTransform)),p.clearcoatRoughnessMap&&(m.clearcoatRoughnessMap.value=p.clearcoatRoughnessMap,e(p.clearcoatRoughnessMap,m.clearcoatRoughnessMapTransform)),p.clearcoatNormalMap&&(m.clearcoatNormalMap.value=p.clearcoatNormalMap,e(p.clearcoatNormalMap,m.clearcoatNormalMapTransform),m.clearcoatNormalScale.value.copy(p.clearcoatNormalScale),p.side===ke&&m.clearcoatNormalScale.value.negate())),p.dispersion>0&&(m.dispersion.value=p.dispersion),p.iridescence>0&&(m.iridescence.value=p.iridescence,m.iridescenceIOR.value=p.iridescenceIOR,m.iridescenceThicknessMinimum.value=p.iridescenceThicknessRange[0],m.iridescenceThicknessMaximum.value=p.iridescenceThicknessRange[1],p.iridescenceMap&&(m.iridescenceMap.value=p.iridescenceMap,e(p.iridescenceMap,m.iridescenceMapTransform)),p.iridescenceThicknessMap&&(m.iridescenceThicknessMap.value=p.iridescenceThicknessMap,e(p.iridescenceThicknessMap,m.iridescenceThicknessMapTransform))),p.transmission>0&&(m.transmission.value=p.transmission,m.transmissionSamplerMap.value=w.texture,m.transmissionSamplerSize.value.set(w.width,w.height),p.transmissionMap&&(m.transmissionMap.value=p.transmissionMap,e(p.transmissionMap,m.transmissionMapTransform)),m.thickness.value=p.thickness,p.thicknessMap&&(m.thicknessMap.value=p.thicknessMap,e(p.thicknessMap,m.thicknessMapTransform)),m.attenuationDistance.value=p.attenuationDistance,m.attenuationColor.value.copy(p.attenuationColor)),p.anisotropy>0&&(m.anisotropyVector.value.set(p.anisotropy*Math.cos(p.anisotropyRotation),p.anisotropy*Math.sin(p.anisotropyRotation)),p.anisotropyMap&&(m.anisotropyMap.value=p.anisotropyMap,e(p.anisotropyMap,m.anisotropyMapTransform))),m.specularIntensity.value=p.specularIntensity,m.specularColor.value.copy(p.specularColor),p.specularColorMap&&(m.specularColorMap.value=p.specularColorMap,e(p.specularColorMap,m.specularColorMapTransform)),p.specularIntensityMap&&(m.specularIntensityMap.value=p.specularIntensityMap,e(p.specularIntensityMap,m.specularIntensityMapTransform))}function _(m,p){p.matcap&&(m.matcap.value=p.matcap)}function y(m,p){let w=t.get(p).light;m.referencePosition.value.setFromMatrixPosition(w.matrixWorld),m.nearDistance.value=w.shadow.camera.near,m.farDistance.value=w.shadow.camera.far}return{refreshFogUniforms:n,refreshMaterialUniforms:s}}function T_(i,t,e,n){let s={},r={},a=[],o=i.getParameter(i.MAX_UNIFORM_BUFFER_BINDINGS);function l(w,E){let M=E.program;n.uniformBlockBinding(w,M)}function c(w,E){let M=s[w.id];M===void 0&&(_(w),M=u(w),s[w.id]=M,w.addEventListener("dispose",m));let P=E.program;n.updateUBOMapping(w,P);let R=t.render.frame;r[w.id]!==R&&(h(w),r[w.id]=R)}function u(w){let E=d();w.__bindingPointIndex=E;let M=i.createBuffer(),P=w.__size,R=w.usage;return i.bindBuffer(i.UNIFORM_BUFFER,M),i.bufferData(i.UNIFORM_BUFFER,P,R),i.bindBuffer(i.UNIFORM_BUFFER,null),i.bindBufferBase(i.UNIFORM_BUFFER,E,M),M}function d(){for(let w=0;w<o;w++)if(a.indexOf(w)===-1)return a.push(w),w;return console.error("THREE.WebGLRenderer: Maximum number of simultaneously usable uniforms groups reached."),0}function h(w){let E=s[w.id],M=w.uniforms,P=w.__cache;i.bindBuffer(i.UNIFORM_BUFFER,E);for(let R=0,C=M.length;R<C;R++){let B=Array.isArray(M[R])?M[R]:[M[R]];for(let b=0,v=B.length;b<v;b++){let D=B[b];if(f(D,R,b,P)===!0){let V=D.__offset,W=Array.isArray(D.value)?D.value:[D.value],q=0;for(let J=0;J<W.length;J++){let $=W[J],st=y($);typeof $=="number"||typeof $=="boolean"?(D.__data[0]=$,i.bufferSubData(i.UNIFORM_BUFFER,V+q,D.__data)):$.isMatrix3?(D.__data[0]=$.elements[0],D.__data[1]=$.elements[1],D.__data[2]=$.elements[2],D.__data[3]=0,D.__data[4]=$.elements[3],D.__data[5]=$.elements[4],D.__data[6]=$.elements[5],D.__data[7]=0,D.__data[8]=$.elements[6],D.__data[9]=$.elements[7],D.__data[10]=$.elements[8],D.__data[11]=0):($.toArray(D.__data,q),q+=st.storage/Float32Array.BYTES_PER_ELEMENT)}i.bufferSubData(i.UNIFORM_BUFFER,V,D.__data)}}}i.bindBuffer(i.UNIFORM_BUFFER,null)}function f(w,E,M,P){let R=w.value,C=E+"_"+M;if(P[C]===void 0)return typeof R=="number"||typeof R=="boolean"?P[C]=R:P[C]=R.clone(),!0;{let B=P[C];if(typeof R=="number"||typeof R=="boolean"){if(B!==R)return P[C]=R,!0}else if(B.equals(R)===!1)return B.copy(R),!0}return!1}function _(w){let E=w.uniforms,M=0,P=16;for(let C=0,B=E.length;C<B;C++){let b=Array.isArray(E[C])?E[C]:[E[C]];for(let v=0,D=b.length;v<D;v++){let V=b[v],W=Array.isArray(V.value)?V.value:[V.value];for(let q=0,J=W.length;q<J;q++){let $=W[q],st=y($),H=M%P,lt=H%st.boundary,pt=H+lt;M+=lt,pt!==0&&P-pt<st.storage&&(M+=P-pt),V.__data=new Float32Array(st.storage/Float32Array.BYTES_PER_ELEMENT),V.__offset=M,M+=st.storage}}}let R=M%P;return R>0&&(M+=P-R),w.__size=M,w.__cache={},this}function y(w){let E={boundary:0,storage:0};return typeof w=="number"||typeof w=="boolean"?(E.boundary=4,E.storage=4):w.isVector2?(E.boundary=8,E.storage=8):w.isVector3||w.isColor?(E.boundary=16,E.storage=12):w.isVector4?(E.boundary=16,E.storage=16):w.isMatrix3?(E.boundary=48,E.storage=48):w.isMatrix4?(E.boundary=64,E.storage=64):w.isTexture?console.warn("THREE.WebGLRenderer: Texture samplers can not be part of an uniforms group."):console.warn("THREE.WebGLRenderer: Unsupported uniform value type.",w),E}function m(w){let E=w.target;E.removeEventListener("dispose",m);let M=a.indexOf(E.__bindingPointIndex);a.splice(M,1),i.deleteBuffer(s[E.id]),delete s[E.id],delete r[E.id]}function p(){for(let w in s)i.deleteBuffer(s[w]);a=[],s={},r={}}return{bind:l,update:c,dispose:p}}var mo=class{constructor(t={}){let{canvas:e=Xh(),context:n=null,depth:s=!0,stencil:r=!1,alpha:a=!1,antialias:o=!1,premultipliedAlpha:l=!0,preserveDrawingBuffer:c=!1,powerPreference:u="default",failIfMajorPerformanceCaveat:d=!1,reversedDepthBuffer:h=!1}=t;this.isWebGLRenderer=!0;let f;if(n!==null){if(typeof WebGLRenderingContext<"u"&&n instanceof WebGLRenderingContext)throw new Error("THREE.WebGLRenderer: WebGL 1 is not supported since r163.");f=n.getContextAttributes().alpha}else f=a;let _=new Uint32Array(4),y=new Int32Array(4),m=null,p=null,w=[],E=[];this.domElement=e,this.debug={checkShaderErrors:!0,onShaderError:null},this.autoClear=!0,this.autoClearColor=!0,this.autoClearDepth=!0,this.autoClearStencil=!0,this.sortObjects=!0,this.clippingPlanes=[],this.localClippingEnabled=!1,this.toneMapping=Hn,this.toneMappingExposure=1,this.transmissionResolutionScale=1;let M=this,P=!1;this._outputColorSpace=ze;let R=0,C=0,B=null,b=-1,v=null,D=new de,V=new de,W=null,q=new kt(0),J=0,$=e.width,st=e.height,H=1,lt=null,pt=null,Tt=new de(0,0,$,st),Gt=new de(0,0,$,st),ee=!1,re=new os,Yt=!1,Y=!1,j=new Jt,gt=new L,Nt=new de,Et={background:null,fog:null,environment:null,overrideMaterial:null,isScene:!0},Xt=!1;function Re(){return B===null?H:1}let T=n;function ae(x,N){return e.getContext(x,N)}try{let x={alpha:!0,depth:s,stencil:r,antialias:o,premultipliedAlpha:l,preserveDrawingBuffer:c,powerPreference:u,failIfMajorPerformanceCaveat:d};if("setAttribute"in e&&e.setAttribute("data-engine",`three.js r${"180"}`),e.addEventListener("webglcontextlost",at,!1),e.addEventListener("webglcontextrestored",mt,!1),e.addEventListener("webglcontextcreationerror",Q,!1),T===null){let N="webgl2";if(T=ae(N,x),T===null)throw ae(N)?new Error("Error creating WebGL context with your selected attributes."):new Error("Error creating WebGL context.")}}catch(x){throw console.error("THREE.WebGLRenderer: "+x.message),x}let Ft,It,yt,oe,vt,zt,be,pe,S,g,O,X,K,G,wt,rt,bt,Mt,nt,dt,Pt,St,ct,Bt;function I(){Ft=new Wm(T),Ft.init(),St=new b_(T,Ft),It=new Om(T,Ft,t,St),yt=new y_(T,Ft),It.reversedDepthBuffer&&h&&yt.buffers.depth.setReversed(!0),oe=new qm(T),vt=new a_,zt=new v_(T,Ft,yt,vt,It,St,oe),be=new zm(M),pe=new Gm(M),S=new ju(T),ct=new Um(T,S),g=new Xm(T,S,oe,ct),O=new Zm(T,g,S,oe),nt=new Ym(T,It,zt),rt=new Bm(vt),X=new r_(M,be,pe,Ft,It,ct,rt),K=new E_(M,vt),G=new l_,wt=new f_(Ft),Mt=new Nm(M,be,pe,yt,O,f,l),bt=new __(M,O,It),Bt=new T_(T,oe,It,yt),dt=new Fm(T,Ft,oe),Pt=new $m(T,Ft,oe),oe.programs=X.programs,M.capabilities=It,M.extensions=Ft,M.properties=vt,M.renderLists=G,M.shadowMap=bt,M.state=yt,M.info=oe}I();let it=new jl(M,T);this.xr=it,this.getContext=function(){return T},this.getContextAttributes=function(){return T.getContextAttributes()},this.forceContextLoss=function(){let x=Ft.get("WEBGL_lose_context");x&&x.loseContext()},this.forceContextRestore=function(){let x=Ft.get("WEBGL_lose_context");x&&x.restoreContext()},this.getPixelRatio=function(){return H},this.setPixelRatio=function(x){x!==void 0&&(H=x,this.setSize($,st,!1))},this.getSize=function(x){return x.set($,st)},this.setSize=function(x,N,z=!0){if(it.isPresenting){console.warn("THREE.WebGLRenderer: Can't change size while VR device is presenting.");return}$=x,st=N,e.width=Math.floor(x*H),e.height=Math.floor(N*H),z===!0&&(e.style.width=x+"px",e.style.height=N+"px"),this.setViewport(0,0,x,N)},this.getDrawingBufferSize=function(x){return x.set($*H,st*H).floor()},this.setDrawingBufferSize=function(x,N,z){$=x,st=N,H=z,e.width=Math.floor(x*z),e.height=Math.floor(N*z),this.setViewport(0,0,x,N)},this.getCurrentViewport=function(x){return x.copy(D)},this.getViewport=function(x){return x.copy(Tt)},this.setViewport=function(x,N,z,k){x.isVector4?Tt.set(x.x,x.y,x.z,x.w):Tt.set(x,N,z,k),yt.viewport(D.copy(Tt).multiplyScalar(H).round())},this.getScissor=function(x){return x.copy(Gt)},this.setScissor=function(x,N,z,k){x.isVector4?Gt.set(x.x,x.y,x.z,x.w):Gt.set(x,N,z,k),yt.scissor(V.copy(Gt).multiplyScalar(H).round())},this.getScissorTest=function(){return ee},this.setScissorTest=function(x){yt.setScissorTest(ee=x)},this.setOpaqueSort=function(x){lt=x},this.setTransparentSort=function(x){pt=x},this.getClearColor=function(x){return x.copy(Mt.getClearColor())},this.setClearColor=function(){Mt.setClearColor(...arguments)},this.getClearAlpha=function(){return Mt.getClearAlpha()},this.setClearAlpha=function(){Mt.setClearAlpha(...arguments)},this.clear=function(x=!0,N=!0,z=!0){let k=0;if(x){let F=!1;if(B!==null){let tt=B.texture.format;F=tt===Ua||tt===Na||tt===Da}if(F){let tt=B.texture.type,ht=tt===xn||tt===hi||tt===cs||tt===ds||tt===Pa||tt===Ia,_t=Mt.getClearColor(),ft=Mt.getClearAlpha(),Rt=_t.r,Lt=_t.g,At=_t.b;ht?(_[0]=Rt,_[1]=Lt,_[2]=At,_[3]=ft,T.clearBufferuiv(T.COLOR,0,_)):(y[0]=Rt,y[1]=Lt,y[2]=At,y[3]=ft,T.clearBufferiv(T.COLOR,0,y))}else k|=T.COLOR_BUFFER_BIT}N&&(k|=T.DEPTH_BUFFER_BIT),z&&(k|=T.STENCIL_BUFFER_BIT,this.state.buffers.stencil.setMask(4294967295)),T.clear(k)},this.clearColor=function(){this.clear(!0,!1,!1)},this.clearDepth=function(){this.clear(!1,!0,!1)},this.clearStencil=function(){this.clear(!1,!1,!0)},this.dispose=function(){e.removeEventListener("webglcontextlost",at,!1),e.removeEventListener("webglcontextrestored",mt,!1),e.removeEventListener("webglcontextcreationerror",Q,!1),Mt.dispose(),G.dispose(),wt.dispose(),vt.dispose(),be.dispose(),pe.dispose(),O.dispose(),ct.dispose(),Bt.dispose(),X.dispose(),it.dispose(),it.removeEventListener("sessionstart",vn),it.removeEventListener("sessionend",ac),di.stop()};function at(x){x.preventDefault(),console.log("THREE.WebGLRenderer: Context Lost."),P=!0}function mt(){console.log("THREE.WebGLRenderer: Context Restored."),P=!1;let x=oe.autoReset,N=bt.enabled,z=bt.autoUpdate,k=bt.needsUpdate,F=bt.type;I(),oe.autoReset=x,bt.enabled=N,bt.autoUpdate=z,bt.needsUpdate=k,bt.type=F}function Q(x){console.error("THREE.WebGLRenderer: A WebGL context could not be created. Reason: ",x.statusMessage)}function Z(x){let N=x.target;N.removeEventListener("dispose",Z),xt(N)}function xt(x){Ut(x),vt.remove(x)}function Ut(x){let N=vt.get(x).programs;N!==void 0&&(N.forEach(function(z){X.releaseProgram(z)}),x.isShaderMaterial&&X.releaseShaderCache(x))}this.renderBufferDirect=function(x,N,z,k,F,tt){N===null&&(N=Et);let ht=F.isMesh&&F.matrixWorld.determinant()<0,_t=Hd(x,N,z,k,F);yt.setMaterial(k,ht);let ft=z.index,Rt=1;if(k.wireframe===!0){if(ft=g.getWireframeAttribute(z),ft===void 0)return;Rt=2}let Lt=z.drawRange,At=z.attributes.position,Wt=Lt.start*Rt,jt=(Lt.start+Lt.count)*Rt;tt!==null&&(Wt=Math.max(Wt,tt.start*Rt),jt=Math.min(jt,(tt.start+tt.count)*Rt)),ft!==null?(Wt=Math.max(Wt,0),jt=Math.min(jt,ft.count)):At!=null&&(Wt=Math.max(Wt,0),jt=Math.min(jt,At.count));let ue=jt-Wt;if(ue<0||ue===1/0)return;ct.setup(F,k,_t,z,ft);let ie,te=dt;if(ft!==null&&(ie=S.get(ft),te=Pt,te.setIndex(ie)),F.isMesh)k.wireframe===!0?(yt.setLineWidth(k.wireframeLinewidth*Re()),te.setMode(T.LINES)):te.setMode(T.TRIANGLES);else if(F.isLine){let Ct=k.linewidth;Ct===void 0&&(Ct=1),yt.setLineWidth(Ct*Re()),F.isLineSegments?te.setMode(T.LINES):F.isLineLoop?te.setMode(T.LINE_LOOP):te.setMode(T.LINE_STRIP)}else F.isPoints?te.setMode(T.POINTS):F.isSprite&&te.setMode(T.TRIANGLES);if(F.isBatchedMesh)if(F._multiDrawInstances!==null)ns("THREE.WebGLRenderer: renderMultiDrawInstances has been deprecated and will be removed in r184. Append to renderMultiDraw arguments and use indirection."),te.renderMultiDrawInstances(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount,F._multiDrawInstances);else if(Ft.get("WEBGL_multi_draw"))te.renderMultiDraw(F._multiDrawStarts,F._multiDrawCounts,F._multiDrawCount);else{let Ct=F._multiDrawStarts,ce=F._multiDrawCounts,qt=F._multiDrawCount,Je=ft?S.get(ft).bytesPerElement:1,Ni=vt.get(k).currentProgram.getUniforms();for(let Ke=0;Ke<qt;Ke++)Ni.setValue(T,"_gl_DrawID",Ke),te.render(Ct[Ke]/Je,ce[Ke])}else if(F.isInstancedMesh)te.renderInstances(Wt,ue,F.count);else if(z.isInstancedBufferGeometry){let Ct=z._maxInstanceCount!==void 0?z._maxInstanceCount:1/0,ce=Math.min(z.instanceCount,Ct);te.renderInstances(Wt,ue,ce)}else te.render(Wt,ue)};function ne(x,N,z){x.transparent===!0&&x.side===An&&x.forceSinglePass===!1?(x.side=ke,x.needsUpdate=!0,pr(x,N,z),x.side=Bn,x.needsUpdate=!0,pr(x,N,z),x.side=An):pr(x,N,z)}this.compile=function(x,N,z=null){z===null&&(z=x),p=wt.get(z),p.init(N),E.push(p),z.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),x!==z&&x.traverseVisible(function(F){F.isLight&&F.layers.test(N.layers)&&(p.pushLight(F),F.castShadow&&p.pushShadow(F))}),p.setupLights();let k=new Set;return x.traverse(function(F){if(!(F.isMesh||F.isPoints||F.isLine||F.isSprite))return;let tt=F.material;if(tt)if(Array.isArray(tt))for(let ht=0;ht<tt.length;ht++){let _t=tt[ht];ne(_t,z,F),k.add(_t)}else ne(tt,z,F),k.add(tt)}),p=E.pop(),k},this.compileAsync=function(x,N,z=null){let k=this.compile(x,N,z);return new Promise(F=>{function tt(){if(k.forEach(function(ht){vt.get(ht).currentProgram.isReady()&&k.delete(ht)}),k.size===0){F(x);return}setTimeout(tt,10)}Ft.get("KHR_parallel_shader_compile")!==null?tt():setTimeout(tt,10)})};let Zt=null;function Rn(x){Zt&&Zt(x)}function vn(){di.stop()}function ac(){di.start()}let di=new yd;di.setAnimationLoop(Rn),typeof self<"u"&&di.setContext(self),this.setAnimationLoop=function(x){Zt=x,it.setAnimationLoop(x),x===null?di.stop():di.start()},it.addEventListener("sessionstart",vn),it.addEventListener("sessionend",ac),this.render=function(x,N){if(N!==void 0&&N.isCamera!==!0){console.error("THREE.WebGLRenderer.render: camera is not an instance of THREE.Camera.");return}if(P===!0)return;if(x.matrixWorldAutoUpdate===!0&&x.updateMatrixWorld(),N.parent===null&&N.matrixWorldAutoUpdate===!0&&N.updateMatrixWorld(),it.enabled===!0&&it.isPresenting===!0&&(it.cameraAutoUpdate===!0&&it.updateCamera(N),N=it.getCamera()),x.isScene===!0&&x.onBeforeRender(M,x,N,B),p=wt.get(x,E.length),p.init(N),E.push(p),j.multiplyMatrices(N.projectionMatrix,N.matrixWorldInverse),re.setFromProjectionMatrix(j,fn,N.reversedDepth),Y=this.localClippingEnabled,Yt=rt.init(this.clippingPlanes,Y),m=G.get(x,w.length),m.init(),w.push(m),it.enabled===!0&&it.isPresenting===!0){let tt=M.xr.getDepthSensingMesh();tt!==null&&Co(tt,N,-1/0,M.sortObjects)}Co(x,N,0,M.sortObjects),m.finish(),M.sortObjects===!0&&m.sort(lt,pt),Xt=it.enabled===!1||it.isPresenting===!1||it.hasDepthSensing()===!1,Xt&&Mt.addToRenderList(m,x),this.info.render.frame++,Yt===!0&&rt.beginShadows();let z=p.state.shadowsArray;bt.render(z,x,N),Yt===!0&&rt.endShadows(),this.info.autoReset===!0&&this.info.reset();let k=m.opaque,F=m.transmissive;if(p.setupLights(),N.isArrayCamera){let tt=N.cameras;if(F.length>0)for(let ht=0,_t=tt.length;ht<_t;ht++){let ft=tt[ht];lc(k,F,x,ft)}Xt&&Mt.render(x);for(let ht=0,_t=tt.length;ht<_t;ht++){let ft=tt[ht];oc(m,x,ft,ft.viewport)}}else F.length>0&&lc(k,F,x,N),Xt&&Mt.render(x),oc(m,x,N);B!==null&&C===0&&(zt.updateMultisampleRenderTarget(B),zt.updateRenderTargetMipmap(B)),x.isScene===!0&&x.onAfterRender(M,x,N),ct.resetDefaultState(),b=-1,v=null,E.pop(),E.length>0?(p=E[E.length-1],Yt===!0&&rt.setGlobalState(M.clippingPlanes,p.state.camera)):p=null,w.pop(),w.length>0?m=w[w.length-1]:m=null};function Co(x,N,z,k){if(x.visible===!1)return;if(x.layers.test(N.layers)){if(x.isGroup)z=x.renderOrder;else if(x.isLOD)x.autoUpdate===!0&&x.update(N);else if(x.isLight)p.pushLight(x),x.castShadow&&p.pushShadow(x);else if(x.isSprite){if(!x.frustumCulled||re.intersectsSprite(x)){k&&Nt.setFromMatrixPosition(x.matrixWorld).applyMatrix4(j);let ht=O.update(x),_t=x.material;_t.visible&&m.push(x,ht,_t,z,Nt.z,null)}}else if((x.isMesh||x.isLine||x.isPoints)&&(!x.frustumCulled||re.intersectsObject(x))){let ht=O.update(x),_t=x.material;if(k&&(x.boundingSphere!==void 0?(x.boundingSphere===null&&x.computeBoundingSphere(),Nt.copy(x.boundingSphere.center)):(ht.boundingSphere===null&&ht.computeBoundingSphere(),Nt.copy(ht.boundingSphere.center)),Nt.applyMatrix4(x.matrixWorld).applyMatrix4(j)),Array.isArray(_t)){let ft=ht.groups;for(let Rt=0,Lt=ft.length;Rt<Lt;Rt++){let At=ft[Rt],Wt=_t[At.materialIndex];Wt&&Wt.visible&&m.push(x,ht,Wt,z,Nt.z,At)}}else _t.visible&&m.push(x,ht,_t,z,Nt.z,null)}}let tt=x.children;for(let ht=0,_t=tt.length;ht<_t;ht++)Co(tt[ht],N,z,k)}function oc(x,N,z,k){let F=x.opaque,tt=x.transmissive,ht=x.transparent;p.setupLightsView(z),Yt===!0&&rt.setGlobalState(M.clippingPlanes,z),k&&yt.viewport(D.copy(k)),F.length>0&&ur(F,N,z),tt.length>0&&ur(tt,N,z),ht.length>0&&ur(ht,N,z),yt.buffers.depth.setTest(!0),yt.buffers.depth.setMask(!0),yt.buffers.color.setMask(!0),yt.setPolygonOffset(!1)}function lc(x,N,z,k){if((z.isScene===!0?z.overrideMaterial:null)!==null)return;p.state.transmissionRenderTarget[k.id]===void 0&&(p.state.transmissionRenderTarget[k.id]=new En(1,1,{generateMipmaps:!0,type:Ft.has("EXT_color_buffer_half_float")||Ft.has("EXT_color_buffer_float")?hs:xn,minFilter:ci,samples:4,stencilBuffer:r,resolveDepthBuffer:!1,resolveStencilBuffer:!1,colorSpace:$t.workingColorSpace}));let tt=p.state.transmissionRenderTarget[k.id],ht=k.viewport||D;tt.setSize(ht.z*M.transmissionResolutionScale,ht.w*M.transmissionResolutionScale);let _t=M.getRenderTarget(),ft=M.getActiveCubeFace(),Rt=M.getActiveMipmapLevel();M.setRenderTarget(tt),M.getClearColor(q),J=M.getClearAlpha(),J<1&&M.setClearColor(16777215,.5),M.clear(),Xt&&Mt.render(z);let Lt=M.toneMapping;M.toneMapping=Hn;let At=k.viewport;if(k.viewport!==void 0&&(k.viewport=void 0),p.setupLightsView(k),Yt===!0&&rt.setGlobalState(M.clippingPlanes,k),ur(x,z,k),zt.updateMultisampleRenderTarget(tt),zt.updateRenderTargetMipmap(tt),Ft.has("WEBGL_multisampled_render_to_texture")===!1){let Wt=!1;for(let jt=0,ue=N.length;jt<ue;jt++){let ie=N[jt],te=ie.object,Ct=ie.geometry,ce=ie.material,qt=ie.group;if(ce.side===An&&te.layers.test(k.layers)){let Je=ce.side;ce.side=ke,ce.needsUpdate=!0,cc(te,z,k,Ct,ce,qt),ce.side=Je,ce.needsUpdate=!0,Wt=!0}}Wt===!0&&(zt.updateMultisampleRenderTarget(tt),zt.updateRenderTargetMipmap(tt))}M.setRenderTarget(_t,ft,Rt),M.setClearColor(q,J),At!==void 0&&(k.viewport=At),M.toneMapping=Lt}function ur(x,N,z){let k=N.isScene===!0?N.overrideMaterial:null;for(let F=0,tt=x.length;F<tt;F++){let ht=x[F],_t=ht.object,ft=ht.geometry,Rt=ht.group,Lt=ht.material;Lt.allowOverride===!0&&k!==null&&(Lt=k),_t.layers.test(z.layers)&&cc(_t,N,z,ft,Lt,Rt)}}function cc(x,N,z,k,F,tt){x.onBeforeRender(M,N,z,k,F,tt),x.modelViewMatrix.multiplyMatrices(z.matrixWorldInverse,x.matrixWorld),x.normalMatrix.getNormalMatrix(x.modelViewMatrix),F.onBeforeRender(M,N,z,k,x,tt),F.transparent===!0&&F.side===An&&F.forceSinglePass===!1?(F.side=ke,F.needsUpdate=!0,M.renderBufferDirect(z,N,k,F,x,tt),F.side=Bn,F.needsUpdate=!0,M.renderBufferDirect(z,N,k,F,x,tt),F.side=An):M.renderBufferDirect(z,N,k,F,x,tt),x.onAfterRender(M,N,z,k,F,tt)}function pr(x,N,z){N.isScene!==!0&&(N=Et);let k=vt.get(x),F=p.state.lights,tt=p.state.shadowsArray,ht=F.state.version,_t=X.getParameters(x,F.state,tt,N,z),ft=X.getProgramCacheKey(_t),Rt=k.programs;k.environment=x.isMeshStandardMaterial?N.environment:null,k.fog=N.fog,k.envMap=(x.isMeshStandardMaterial?pe:be).get(x.envMap||k.environment),k.envMapRotation=k.environment!==null&&x.envMap===null?N.environmentRotation:x.envMapRotation,Rt===void 0&&(x.addEventListener("dispose",Z),Rt=new Map,k.programs=Rt);let Lt=Rt.get(ft);if(Lt!==void 0){if(k.currentProgram===Lt&&k.lightsStateVersion===ht)return dc(x,_t),Lt}else _t.uniforms=X.getUniforms(x),x.onBeforeCompile(_t,M),Lt=X.acquireProgram(_t,ft),Rt.set(ft,Lt),k.uniforms=_t.uniforms;let At=k.uniforms;return(!x.isShaderMaterial&&!x.isRawShaderMaterial||x.clipping===!0)&&(At.clippingPlanes=rt.uniform),dc(x,_t),k.needsLights=Wd(x),k.lightsStateVersion=ht,k.needsLights&&(At.ambientLightColor.value=F.state.ambient,At.lightProbe.value=F.state.probe,At.directionalLights.value=F.state.directional,At.directionalLightShadows.value=F.state.directionalShadow,At.spotLights.value=F.state.spot,At.spotLightShadows.value=F.state.spotShadow,At.rectAreaLights.value=F.state.rectArea,At.ltc_1.value=F.state.rectAreaLTC1,At.ltc_2.value=F.state.rectAreaLTC2,At.pointLights.value=F.state.point,At.pointLightShadows.value=F.state.pointShadow,At.hemisphereLights.value=F.state.hemi,At.directionalShadowMap.value=F.state.directionalShadowMap,At.directionalShadowMatrix.value=F.state.directionalShadowMatrix,At.spotShadowMap.value=F.state.spotShadowMap,At.spotLightMatrix.value=F.state.spotLightMatrix,At.spotLightMap.value=F.state.spotLightMap,At.pointShadowMap.value=F.state.pointShadowMap,At.pointShadowMatrix.value=F.state.pointShadowMatrix),k.currentProgram=Lt,k.uniformsList=null,Lt}function hc(x){if(x.uniformsList===null){let N=x.currentProgram.getUniforms();x.uniformsList=gs.seqWithValue(N.seq,x.uniforms)}return x.uniformsList}function dc(x,N){let z=vt.get(x);z.outputColorSpace=N.outputColorSpace,z.batching=N.batching,z.batchingColor=N.batchingColor,z.instancing=N.instancing,z.instancingColor=N.instancingColor,z.instancingMorph=N.instancingMorph,z.skinning=N.skinning,z.morphTargets=N.morphTargets,z.morphNormals=N.morphNormals,z.morphColors=N.morphColors,z.morphTargetsCount=N.morphTargetsCount,z.numClippingPlanes=N.numClippingPlanes,z.numIntersection=N.numClipIntersection,z.vertexAlphas=N.vertexAlphas,z.vertexTangents=N.vertexTangents,z.toneMapping=N.toneMapping}function Hd(x,N,z,k,F){N.isScene!==!0&&(N=Et),zt.resetTextureUnits();let tt=N.fog,ht=k.isMeshStandardMaterial?N.environment:null,_t=B===null?M.outputColorSpace:B.isXRRenderTarget===!0?B.texture.colorSpace:Mi,ft=(k.isMeshStandardMaterial?pe:be).get(k.envMap||ht),Rt=k.vertexColors===!0&&!!z.attributes.color&&z.attributes.color.itemSize===4,Lt=!!z.attributes.tangent&&(!!k.normalMap||k.anisotropy>0),At=!!z.morphAttributes.position,Wt=!!z.morphAttributes.normal,jt=!!z.morphAttributes.color,ue=Hn;k.toneMapped&&(B===null||B.isXRRenderTarget===!0)&&(ue=M.toneMapping);let ie=z.morphAttributes.position||z.morphAttributes.normal||z.morphAttributes.color,te=ie!==void 0?ie.length:0,Ct=vt.get(k),ce=p.state.lights;if(Yt===!0&&(Y===!0||x!==v)){let Oe=x===v&&k.id===b;rt.setState(k,x,Oe)}let qt=!1;k.version===Ct.__version?(Ct.needsLights&&Ct.lightsStateVersion!==ce.state.version||Ct.outputColorSpace!==_t||F.isBatchedMesh&&Ct.batching===!1||!F.isBatchedMesh&&Ct.batching===!0||F.isBatchedMesh&&Ct.batchingColor===!0&&F.colorTexture===null||F.isBatchedMesh&&Ct.batchingColor===!1&&F.colorTexture!==null||F.isInstancedMesh&&Ct.instancing===!1||!F.isInstancedMesh&&Ct.instancing===!0||F.isSkinnedMesh&&Ct.skinning===!1||!F.isSkinnedMesh&&Ct.skinning===!0||F.isInstancedMesh&&Ct.instancingColor===!0&&F.instanceColor===null||F.isInstancedMesh&&Ct.instancingColor===!1&&F.instanceColor!==null||F.isInstancedMesh&&Ct.instancingMorph===!0&&F.morphTexture===null||F.isInstancedMesh&&Ct.instancingMorph===!1&&F.morphTexture!==null||Ct.envMap!==ft||k.fog===!0&&Ct.fog!==tt||Ct.numClippingPlanes!==void 0&&(Ct.numClippingPlanes!==rt.numPlanes||Ct.numIntersection!==rt.numIntersection)||Ct.vertexAlphas!==Rt||Ct.vertexTangents!==Lt||Ct.morphTargets!==At||Ct.morphNormals!==Wt||Ct.morphColors!==jt||Ct.toneMapping!==ue||Ct.morphTargetsCount!==te)&&(qt=!0):(qt=!0,Ct.__version=k.version);let Je=Ct.currentProgram;qt===!0&&(Je=pr(k,N,F));let Ni=!1,Ke=!1,Ss=!1,he=Je.getUniforms(),nn=Ct.uniforms;if(yt.useProgram(Je.program)&&(Ni=!0,Ke=!0,Ss=!0),k.id!==b&&(b=k.id,Ke=!0),Ni||v!==x){yt.buffers.depth.getReversed()&&x.reversedDepth!==!0&&(x._reversedDepth=!0,x.updateProjectionMatrix()),he.setValue(T,"projectionMatrix",x.projectionMatrix),he.setValue(T,"viewMatrix",x.matrixWorldInverse);let Ve=he.map.cameraPosition;Ve!==void 0&&Ve.setValue(T,gt.setFromMatrixPosition(x.matrixWorld)),It.logarithmicDepthBuffer&&he.setValue(T,"logDepthBufFC",2/(Math.log(x.far+1)/Math.LN2)),(k.isMeshPhongMaterial||k.isMeshToonMaterial||k.isMeshLambertMaterial||k.isMeshBasicMaterial||k.isMeshStandardMaterial||k.isShaderMaterial)&&he.setValue(T,"isOrthographic",x.isOrthographicCamera===!0),v!==x&&(v=x,Ke=!0,Ss=!0)}if(F.isSkinnedMesh){he.setOptional(T,F,"bindMatrix"),he.setOptional(T,F,"bindMatrixInverse");let Oe=F.skeleton;Oe&&(Oe.boneTexture===null&&Oe.computeBoneTexture(),he.setValue(T,"boneTexture",Oe.boneTexture,zt))}F.isBatchedMesh&&(he.setOptional(T,F,"batchingTexture"),he.setValue(T,"batchingTexture",F._matricesTexture,zt),he.setOptional(T,F,"batchingIdTexture"),he.setValue(T,"batchingIdTexture",F._indirectTexture,zt),he.setOptional(T,F,"batchingColorTexture"),F._colorsTexture!==null&&he.setValue(T,"batchingColorTexture",F._colorsTexture,zt));let sn=z.morphAttributes;if((sn.position!==void 0||sn.normal!==void 0||sn.color!==void 0)&&nt.update(F,z,Je),(Ke||Ct.receiveShadow!==F.receiveShadow)&&(Ct.receiveShadow=F.receiveShadow,he.setValue(T,"receiveShadow",F.receiveShadow)),k.isMeshGouraudMaterial&&k.envMap!==null&&(nn.envMap.value=ft,nn.flipEnvMap.value=ft.isCubeTexture&&ft.isRenderTargetTexture===!1?-1:1),k.isMeshStandardMaterial&&k.envMap===null&&N.environment!==null&&(nn.envMapIntensity.value=N.environmentIntensity),Ke&&(he.setValue(T,"toneMappingExposure",M.toneMappingExposure),Ct.needsLights&&Gd(nn,Ss),tt&&k.fog===!0&&K.refreshFogUniforms(nn,tt),K.refreshMaterialUniforms(nn,k,H,st,p.state.transmissionRenderTarget[x.id]),gs.upload(T,hc(Ct),nn,zt)),k.isShaderMaterial&&k.uniformsNeedUpdate===!0&&(gs.upload(T,hc(Ct),nn,zt),k.uniformsNeedUpdate=!1),k.isSpriteMaterial&&he.setValue(T,"center",F.center),he.setValue(T,"modelViewMatrix",F.modelViewMatrix),he.setValue(T,"normalMatrix",F.normalMatrix),he.setValue(T,"modelMatrix",F.matrixWorld),k.isShaderMaterial||k.isRawShaderMaterial){let Oe=k.uniformsGroups;for(let Ve=0,Ro=Oe.length;Ve<Ro;Ve++){let ui=Oe[Ve];Bt.update(ui,Je),Bt.bind(ui,Je)}}return Je}function Gd(x,N){x.ambientLightColor.needsUpdate=N,x.lightProbe.needsUpdate=N,x.directionalLights.needsUpdate=N,x.directionalLightShadows.needsUpdate=N,x.pointLights.needsUpdate=N,x.pointLightShadows.needsUpdate=N,x.spotLights.needsUpdate=N,x.spotLightShadows.needsUpdate=N,x.rectAreaLights.needsUpdate=N,x.hemisphereLights.needsUpdate=N}function Wd(x){return x.isMeshLambertMaterial||x.isMeshToonMaterial||x.isMeshPhongMaterial||x.isMeshStandardMaterial||x.isShadowMaterial||x.isShaderMaterial&&x.lights===!0}this.getActiveCubeFace=function(){return R},this.getActiveMipmapLevel=function(){return C},this.getRenderTarget=function(){return B},this.setRenderTargetTextures=function(x,N,z){let k=vt.get(x);k.__autoAllocateDepthBuffer=x.resolveDepthBuffer===!1,k.__autoAllocateDepthBuffer===!1&&(k.__useRenderToTexture=!1),vt.get(x.texture).__webglTexture=N,vt.get(x.depthTexture).__webglTexture=k.__autoAllocateDepthBuffer?void 0:z,k.__hasExternalTextures=!0},this.setRenderTargetFramebuffer=function(x,N){let z=vt.get(x);z.__webglFramebuffer=N,z.__useDefaultFramebuffer=N===void 0};let Xd=T.createFramebuffer();this.setRenderTarget=function(x,N=0,z=0){B=x,R=N,C=z;let k=!0,F=null,tt=!1,ht=!1;if(x){let ft=vt.get(x);if(ft.__useDefaultFramebuffer!==void 0)yt.bindFramebuffer(T.FRAMEBUFFER,null),k=!1;else if(ft.__webglFramebuffer===void 0)zt.setupRenderTarget(x);else if(ft.__hasExternalTextures)zt.rebindTextures(x,vt.get(x.texture).__webglTexture,vt.get(x.depthTexture).__webglTexture);else if(x.depthBuffer){let At=x.depthTexture;if(ft.__boundDepthTexture!==At){if(At!==null&&vt.has(At)&&(x.width!==At.image.width||x.height!==At.image.height))throw new Error("WebGLRenderTarget: Attached DepthTexture is initialized to the incorrect size.");zt.setupDepthRenderbuffer(x)}}let Rt=x.texture;(Rt.isData3DTexture||Rt.isDataArrayTexture||Rt.isCompressedArrayTexture)&&(ht=!0);let Lt=vt.get(x).__webglFramebuffer;x.isWebGLCubeRenderTarget?(Array.isArray(Lt[N])?F=Lt[N][z]:F=Lt[N],tt=!0):x.samples>0&&zt.useMultisampledRTT(x)===!1?F=vt.get(x).__webglMultisampledFramebuffer:Array.isArray(Lt)?F=Lt[z]:F=Lt,D.copy(x.viewport),V.copy(x.scissor),W=x.scissorTest}else D.copy(Tt).multiplyScalar(H).floor(),V.copy(Gt).multiplyScalar(H).floor(),W=ee;if(z!==0&&(F=Xd),yt.bindFramebuffer(T.FRAMEBUFFER,F)&&k&&yt.drawBuffers(x,F),yt.viewport(D),yt.scissor(V),yt.setScissorTest(W),tt){let ft=vt.get(x.texture);T.framebufferTexture2D(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_CUBE_MAP_POSITIVE_X+N,ft.__webglTexture,z)}else if(ht){let ft=N;for(let Rt=0;Rt<x.textures.length;Rt++){let Lt=vt.get(x.textures[Rt]);T.framebufferTextureLayer(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0+Rt,Lt.__webglTexture,z,ft)}}else if(x!==null&&z!==0){let ft=vt.get(x.texture);T.framebufferTexture2D(T.FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_2D,ft.__webglTexture,z)}b=-1},this.readRenderTargetPixels=function(x,N,z,k,F,tt,ht,_t=0){if(!(x&&x.isWebGLRenderTarget)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");return}let ft=vt.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&ht!==void 0&&(ft=ft[ht]),ft){yt.bindFramebuffer(T.FRAMEBUFFER,ft);try{let Rt=x.textures[_t],Lt=Rt.format,At=Rt.type;if(!It.textureFormatReadable(Lt)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in RGBA or implementation defined format.");return}if(!It.textureTypeReadable(At)){console.error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not in UnsignedByteType or implementation defined type.");return}N>=0&&N<=x.width-k&&z>=0&&z<=x.height-F&&(x.textures.length>1&&T.readBuffer(T.COLOR_ATTACHMENT0+_t),T.readPixels(N,z,k,F,St.convert(Lt),St.convert(At),tt))}finally{let Rt=B!==null?vt.get(B).__webglFramebuffer:null;yt.bindFramebuffer(T.FRAMEBUFFER,Rt)}}},this.readRenderTargetPixelsAsync=async function(x,N,z,k,F,tt,ht,_t=0){if(!(x&&x.isWebGLRenderTarget))throw new Error("THREE.WebGLRenderer.readRenderTargetPixels: renderTarget is not THREE.WebGLRenderTarget.");let ft=vt.get(x).__webglFramebuffer;if(x.isWebGLCubeRenderTarget&&ht!==void 0&&(ft=ft[ht]),ft)if(N>=0&&N<=x.width-k&&z>=0&&z<=x.height-F){yt.bindFramebuffer(T.FRAMEBUFFER,ft);let Rt=x.textures[_t],Lt=Rt.format,At=Rt.type;if(!It.textureFormatReadable(Lt))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in RGBA or implementation defined format.");if(!It.textureTypeReadable(At))throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: renderTarget is not in UnsignedByteType or implementation defined type.");let Wt=T.createBuffer();T.bindBuffer(T.PIXEL_PACK_BUFFER,Wt),T.bufferData(T.PIXEL_PACK_BUFFER,tt.byteLength,T.STREAM_READ),x.textures.length>1&&T.readBuffer(T.COLOR_ATTACHMENT0+_t),T.readPixels(N,z,k,F,St.convert(Lt),St.convert(At),0);let jt=B!==null?vt.get(B).__webglFramebuffer:null;yt.bindFramebuffer(T.FRAMEBUFFER,jt);let ue=T.fenceSync(T.SYNC_GPU_COMMANDS_COMPLETE,0);return T.flush(),await $h(T,ue,4),T.bindBuffer(T.PIXEL_PACK_BUFFER,Wt),T.getBufferSubData(T.PIXEL_PACK_BUFFER,0,tt),T.deleteBuffer(Wt),T.deleteSync(ue),tt}else throw new Error("THREE.WebGLRenderer.readRenderTargetPixelsAsync: requested read bounds are out of range.")},this.copyFramebufferToTexture=function(x,N=null,z=0){let k=Math.pow(2,-z),F=Math.floor(x.image.width*k),tt=Math.floor(x.image.height*k),ht=N!==null?N.x:0,_t=N!==null?N.y:0;zt.setTexture2D(x,0),T.copyTexSubImage2D(T.TEXTURE_2D,z,0,0,ht,_t,F,tt),yt.unbindTexture()};let $d=T.createFramebuffer(),qd=T.createFramebuffer();this.copyTextureToTexture=function(x,N,z=null,k=null,F=0,tt=null){tt===null&&(F!==0?(ns("WebGLRenderer: copyTextureToTexture function signature has changed to support src and dst mipmap levels."),tt=F,F=0):tt=0);let ht,_t,ft,Rt,Lt,At,Wt,jt,ue,ie=x.isCompressedTexture?x.mipmaps[tt]:x.image;if(z!==null)ht=z.max.x-z.min.x,_t=z.max.y-z.min.y,ft=z.isBox3?z.max.z-z.min.z:1,Rt=z.min.x,Lt=z.min.y,At=z.isBox3?z.min.z:0;else{let sn=Math.pow(2,-F);ht=Math.floor(ie.width*sn),_t=Math.floor(ie.height*sn),x.isDataArrayTexture?ft=ie.depth:x.isData3DTexture?ft=Math.floor(ie.depth*sn):ft=1,Rt=0,Lt=0,At=0}k!==null?(Wt=k.x,jt=k.y,ue=k.z):(Wt=0,jt=0,ue=0);let te=St.convert(N.format),Ct=St.convert(N.type),ce;N.isData3DTexture?(zt.setTexture3D(N,0),ce=T.TEXTURE_3D):N.isDataArrayTexture||N.isCompressedArrayTexture?(zt.setTexture2DArray(N,0),ce=T.TEXTURE_2D_ARRAY):(zt.setTexture2D(N,0),ce=T.TEXTURE_2D),T.pixelStorei(T.UNPACK_FLIP_Y_WEBGL,N.flipY),T.pixelStorei(T.UNPACK_PREMULTIPLY_ALPHA_WEBGL,N.premultiplyAlpha),T.pixelStorei(T.UNPACK_ALIGNMENT,N.unpackAlignment);let qt=T.getParameter(T.UNPACK_ROW_LENGTH),Je=T.getParameter(T.UNPACK_IMAGE_HEIGHT),Ni=T.getParameter(T.UNPACK_SKIP_PIXELS),Ke=T.getParameter(T.UNPACK_SKIP_ROWS),Ss=T.getParameter(T.UNPACK_SKIP_IMAGES);T.pixelStorei(T.UNPACK_ROW_LENGTH,ie.width),T.pixelStorei(T.UNPACK_IMAGE_HEIGHT,ie.height),T.pixelStorei(T.UNPACK_SKIP_PIXELS,Rt),T.pixelStorei(T.UNPACK_SKIP_ROWS,Lt),T.pixelStorei(T.UNPACK_SKIP_IMAGES,At);let he=x.isDataArrayTexture||x.isData3DTexture,nn=N.isDataArrayTexture||N.isData3DTexture;if(x.isDepthTexture){let sn=vt.get(x),Oe=vt.get(N),Ve=vt.get(sn.__renderTarget),Ro=vt.get(Oe.__renderTarget);yt.bindFramebuffer(T.READ_FRAMEBUFFER,Ve.__webglFramebuffer),yt.bindFramebuffer(T.DRAW_FRAMEBUFFER,Ro.__webglFramebuffer);for(let ui=0;ui<ft;ui++)he&&(T.framebufferTextureLayer(T.READ_FRAMEBUFFER,T.COLOR_ATTACHMENT0,vt.get(x).__webglTexture,F,At+ui),T.framebufferTextureLayer(T.DRAW_FRAMEBUFFER,T.COLOR_ATTACHMENT0,vt.get(N).__webglTexture,tt,ue+ui)),T.blitFramebuffer(Rt,Lt,ht,_t,Wt,jt,ht,_t,T.DEPTH_BUFFER_BIT,T.NEAREST);yt.bindFramebuffer(T.READ_FRAMEBUFFER,null),yt.bindFramebuffer(T.DRAW_FRAMEBUFFER,null)}else if(F!==0||x.isRenderTargetTexture||vt.has(x)){let sn=vt.get(x),Oe=vt.get(N);yt.bindFramebuffer(T.READ_FRAMEBUFFER,$d),yt.bindFramebuffer(T.DRAW_FRAMEBUFFER,qd);for(let Ve=0;Ve<ft;Ve++)he?T.framebufferTextureLayer(T.READ_FRAMEBUFFER,T.COLOR_ATTACHMENT0,sn.__webglTexture,F,At+Ve):T.framebufferTexture2D(T.READ_FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_2D,sn.__webglTexture,F),nn?T.framebufferTextureLayer(T.DRAW_FRAMEBUFFER,T.COLOR_ATTACHMENT0,Oe.__webglTexture,tt,ue+Ve):T.framebufferTexture2D(T.DRAW_FRAMEBUFFER,T.COLOR_ATTACHMENT0,T.TEXTURE_2D,Oe.__webglTexture,tt),F!==0?T.blitFramebuffer(Rt,Lt,ht,_t,Wt,jt,ht,_t,T.COLOR_BUFFER_BIT,T.NEAREST):nn?T.copyTexSubImage3D(ce,tt,Wt,jt,ue+Ve,Rt,Lt,ht,_t):T.copyTexSubImage2D(ce,tt,Wt,jt,Rt,Lt,ht,_t);yt.bindFramebuffer(T.READ_FRAMEBUFFER,null),yt.bindFramebuffer(T.DRAW_FRAMEBUFFER,null)}else nn?x.isDataTexture||x.isData3DTexture?T.texSubImage3D(ce,tt,Wt,jt,ue,ht,_t,ft,te,Ct,ie.data):N.isCompressedArrayTexture?T.compressedTexSubImage3D(ce,tt,Wt,jt,ue,ht,_t,ft,te,ie.data):T.texSubImage3D(ce,tt,Wt,jt,ue,ht,_t,ft,te,Ct,ie):x.isDataTexture?T.texSubImage2D(T.TEXTURE_2D,tt,Wt,jt,ht,_t,te,Ct,ie.data):x.isCompressedTexture?T.compressedTexSubImage2D(T.TEXTURE_2D,tt,Wt,jt,ie.width,ie.height,te,ie.data):T.texSubImage2D(T.TEXTURE_2D,tt,Wt,jt,ht,_t,te,Ct,ie);T.pixelStorei(T.UNPACK_ROW_LENGTH,qt),T.pixelStorei(T.UNPACK_IMAGE_HEIGHT,Je),T.pixelStorei(T.UNPACK_SKIP_PIXELS,Ni),T.pixelStorei(T.UNPACK_SKIP_ROWS,Ke),T.pixelStorei(T.UNPACK_SKIP_IMAGES,Ss),tt===0&&N.generateMipmaps&&T.generateMipmap(ce),yt.unbindTexture()},this.initRenderTarget=function(x){vt.get(x).__webglFramebuffer===void 0&&zt.setupRenderTarget(x)},this.initTexture=function(x){x.isCubeTexture?zt.setTextureCube(x,0):x.isData3DTexture?zt.setTexture3D(x,0):x.isDataArrayTexture||x.isCompressedArrayTexture?zt.setTexture2DArray(x,0):zt.setTexture2D(x,0),yt.unbindTexture()},this.resetState=function(){R=0,C=0,B=null,yt.reset(),ct.reset()},typeof __THREE_DEVTOOLS__<"u"&&__THREE_DEVTOOLS__.dispatchEvent(new CustomEvent("observe",{detail:this}))}get coordinateSystem(){return fn}get outputColorSpace(){return this._outputColorSpace}set outputColorSpace(t){this._outputColorSpace=t;let e=this.getContext();e.drawingBufferColorSpace=$t._getDrawingBufferColorSpace(t),e.unpackColorSpace=$t._getUnpackColorSpace()}};var Ed={type:"change"},ec={type:"start"},Ad={type:"end"},_o=new ii,Td=new an,A_=Math.cos(70*Wn.DEG2RAD),ye=new L,qe=2*Math.PI,Qt={NONE:-1,ROTATE:0,DOLLY:1,PAN:2,TOUCH_ROTATE:3,TOUCH_PAN:4,TOUCH_DOLLY_PAN:5,TOUCH_DOLLY_ROTATE:6},tc=1e-6,xo=class extends nr{constructor(t,e=null){super(t,e),this.state=Qt.NONE,this.target=new L,this.cursor=new L,this.minDistance=0,this.maxDistance=1/0,this.minZoom=0,this.maxZoom=1/0,this.minTargetRadius=0,this.maxTargetRadius=1/0,this.minPolarAngle=0,this.maxPolarAngle=Math.PI,this.minAzimuthAngle=-1/0,this.maxAzimuthAngle=1/0,this.enableDamping=!1,this.dampingFactor=.05,this.enableZoom=!0,this.zoomSpeed=1,this.enableRotate=!0,this.rotateSpeed=1,this.keyRotateSpeed=1,this.enablePan=!0,this.panSpeed=1,this.screenSpacePanning=!0,this.keyPanSpeed=7,this.zoomToCursor=!1,this.autoRotate=!1,this.autoRotateSpeed=2,this.keys={LEFT:"ArrowLeft",UP:"ArrowUp",RIGHT:"ArrowRight",BOTTOM:"ArrowDown"},this.mouseButtons={LEFT:oi.ROTATE,MIDDLE:oi.DOLLY,RIGHT:oi.PAN},this.touches={ONE:li.ROTATE,TWO:li.DOLLY_PAN},this.target0=this.target.clone(),this.position0=this.object.position.clone(),this.zoom0=this.object.zoom,this._domElementKeyEvents=null,this._lastPosition=new L,this._lastQuaternion=new Ue,this._lastTargetPosition=new L,this._quat=new Ue().setFromUnitVectors(t.up,new L(0,1,0)),this._quatInverse=this._quat.clone().invert(),this._spherical=new ai,this._sphericalDelta=new ai,this._scale=1,this._panOffset=new L,this._rotateStart=new Dt,this._rotateEnd=new Dt,this._rotateDelta=new Dt,this._panStart=new Dt,this._panEnd=new Dt,this._panDelta=new Dt,this._dollyStart=new Dt,this._dollyEnd=new Dt,this._dollyDelta=new Dt,this._dollyDirection=new L,this._mouse=new Dt,this._performCursorZoom=!1,this._pointers=[],this._pointerPositions={},this._controlActive=!1,this._onPointerMove=R_.bind(this),this._onPointerDown=C_.bind(this),this._onPointerUp=P_.bind(this),this._onContextMenu=O_.bind(this),this._onMouseWheel=D_.bind(this),this._onKeyDown=N_.bind(this),this._onTouchStart=U_.bind(this),this._onTouchMove=F_.bind(this),this._onMouseDown=I_.bind(this),this._onMouseMove=L_.bind(this),this._interceptControlDown=B_.bind(this),this._interceptControlUp=z_.bind(this),this.domElement!==null&&this.connect(this.domElement),this.update()}connect(t){super.connect(t),this.domElement.addEventListener("pointerdown",this._onPointerDown),this.domElement.addEventListener("pointercancel",this._onPointerUp),this.domElement.addEventListener("contextmenu",this._onContextMenu),this.domElement.addEventListener("wheel",this._onMouseWheel,{passive:!1}),this.domElement.getRootNode().addEventListener("keydown",this._interceptControlDown,{passive:!0,capture:!0}),this.domElement.style.touchAction="none"}disconnect(){this.domElement.removeEventListener("pointerdown",this._onPointerDown),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.domElement.removeEventListener("pointercancel",this._onPointerUp),this.domElement.removeEventListener("wheel",this._onMouseWheel),this.domElement.removeEventListener("contextmenu",this._onContextMenu),this.stopListenToKeyEvents(),this.domElement.getRootNode().removeEventListener("keydown",this._interceptControlDown,{capture:!0}),this.domElement.style.touchAction="auto"}dispose(){this.disconnect()}getPolarAngle(){return this._spherical.phi}getAzimuthalAngle(){return this._spherical.theta}getDistance(){return this.object.position.distanceTo(this.target)}listenToKeyEvents(t){t.addEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=t}stopListenToKeyEvents(){this._domElementKeyEvents!==null&&(this._domElementKeyEvents.removeEventListener("keydown",this._onKeyDown),this._domElementKeyEvents=null)}saveState(){this.target0.copy(this.target),this.position0.copy(this.object.position),this.zoom0=this.object.zoom}reset(){this.target.copy(this.target0),this.object.position.copy(this.position0),this.object.zoom=this.zoom0,this.object.updateProjectionMatrix(),this.dispatchEvent(Ed),this.update(),this.state=Qt.NONE}update(t=null){let e=this.object.position;ye.copy(e).sub(this.target),ye.applyQuaternion(this._quat),this._spherical.setFromVector3(ye),this.autoRotate&&this.state===Qt.NONE&&this._rotateLeft(this._getAutoRotationAngle(t)),this.enableDamping?(this._spherical.theta+=this._sphericalDelta.theta*this.dampingFactor,this._spherical.phi+=this._sphericalDelta.phi*this.dampingFactor):(this._spherical.theta+=this._sphericalDelta.theta,this._spherical.phi+=this._sphericalDelta.phi);let n=this.minAzimuthAngle,s=this.maxAzimuthAngle;isFinite(n)&&isFinite(s)&&(n<-Math.PI?n+=qe:n>Math.PI&&(n-=qe),s<-Math.PI?s+=qe:s>Math.PI&&(s-=qe),n<=s?this._spherical.theta=Math.max(n,Math.min(s,this._spherical.theta)):this._spherical.theta=this._spherical.theta>(n+s)/2?Math.max(n,this._spherical.theta):Math.min(s,this._spherical.theta)),this._spherical.phi=Math.max(this.minPolarAngle,Math.min(this.maxPolarAngle,this._spherical.phi)),this._spherical.makeSafe(),this.enableDamping===!0?this.target.addScaledVector(this._panOffset,this.dampingFactor):this.target.add(this._panOffset),this.target.sub(this.cursor),this.target.clampLength(this.minTargetRadius,this.maxTargetRadius),this.target.add(this.cursor);let r=!1;if(this.zoomToCursor&&this._performCursorZoom||this.object.isOrthographicCamera)this._spherical.radius=this._clampDistance(this._spherical.radius);else{let a=this._spherical.radius;this._spherical.radius=this._clampDistance(this._spherical.radius*this._scale),r=a!=this._spherical.radius}if(ye.setFromSpherical(this._spherical),ye.applyQuaternion(this._quatInverse),e.copy(this.target).add(ye),this.object.lookAt(this.target),this.enableDamping===!0?(this._sphericalDelta.theta*=1-this.dampingFactor,this._sphericalDelta.phi*=1-this.dampingFactor,this._panOffset.multiplyScalar(1-this.dampingFactor)):(this._sphericalDelta.set(0,0,0),this._panOffset.set(0,0,0)),this.zoomToCursor&&this._performCursorZoom){let a=null;if(this.object.isPerspectiveCamera){let o=ye.length();a=this._clampDistance(o*this._scale);let l=o-a;this.object.position.addScaledVector(this._dollyDirection,l),this.object.updateMatrixWorld(),r=!!l}else if(this.object.isOrthographicCamera){let o=new L(this._mouse.x,this._mouse.y,0);o.unproject(this.object);let l=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),this.object.updateProjectionMatrix(),r=l!==this.object.zoom;let c=new L(this._mouse.x,this._mouse.y,0);c.unproject(this.object),this.object.position.sub(c).add(o),this.object.updateMatrixWorld(),a=ye.length()}else console.warn("WARNING: OrbitControls.js encountered an unknown camera type - zoom to cursor disabled."),this.zoomToCursor=!1;a!==null&&(this.screenSpacePanning?this.target.set(0,0,-1).transformDirection(this.object.matrix).multiplyScalar(a).add(this.object.position):(_o.origin.copy(this.object.position),_o.direction.set(0,0,-1).transformDirection(this.object.matrix),Math.abs(this.object.up.dot(_o.direction))<A_?this.object.lookAt(this.target):(Td.setFromNormalAndCoplanarPoint(this.object.up,this.target),_o.intersectPlane(Td,this.target))))}else if(this.object.isOrthographicCamera){let a=this.object.zoom;this.object.zoom=Math.max(this.minZoom,Math.min(this.maxZoom,this.object.zoom/this._scale)),a!==this.object.zoom&&(this.object.updateProjectionMatrix(),r=!0)}return this._scale=1,this._performCursorZoom=!1,r||this._lastPosition.distanceToSquared(this.object.position)>tc||8*(1-this._lastQuaternion.dot(this.object.quaternion))>tc||this._lastTargetPosition.distanceToSquared(this.target)>tc?(this.dispatchEvent(Ed),this._lastPosition.copy(this.object.position),this._lastQuaternion.copy(this.object.quaternion),this._lastTargetPosition.copy(this.target),!0):!1}_getAutoRotationAngle(t){return t!==null?qe/60*this.autoRotateSpeed*t:qe/60/60*this.autoRotateSpeed}_getZoomScale(t){let e=Math.abs(t*.01);return Math.pow(.95,this.zoomSpeed*e)}_rotateLeft(t){this._sphericalDelta.theta-=t}_rotateUp(t){this._sphericalDelta.phi-=t}_panLeft(t,e){ye.setFromMatrixColumn(e,0),ye.multiplyScalar(-t),this._panOffset.add(ye)}_panUp(t,e){this.screenSpacePanning===!0?ye.setFromMatrixColumn(e,1):(ye.setFromMatrixColumn(e,0),ye.crossVectors(this.object.up,ye)),ye.multiplyScalar(t),this._panOffset.add(ye)}_pan(t,e){let n=this.domElement;if(this.object.isPerspectiveCamera){let s=this.object.position;ye.copy(s).sub(this.target);let r=ye.length();r*=Math.tan(this.object.fov/2*Math.PI/180),this._panLeft(2*t*r/n.clientHeight,this.object.matrix),this._panUp(2*e*r/n.clientHeight,this.object.matrix)}else this.object.isOrthographicCamera?(this._panLeft(t*(this.object.right-this.object.left)/this.object.zoom/n.clientWidth,this.object.matrix),this._panUp(e*(this.object.top-this.object.bottom)/this.object.zoom/n.clientHeight,this.object.matrix)):(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - pan disabled."),this.enablePan=!1)}_dollyOut(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale/=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_dollyIn(t){this.object.isPerspectiveCamera||this.object.isOrthographicCamera?this._scale*=t:(console.warn("WARNING: OrbitControls.js encountered an unknown camera type - dolly/zoom disabled."),this.enableZoom=!1)}_updateZoomParameters(t,e){if(!this.zoomToCursor)return;this._performCursorZoom=!0;let n=this.domElement.getBoundingClientRect(),s=t-n.left,r=e-n.top,a=n.width,o=n.height;this._mouse.x=s/a*2-1,this._mouse.y=-(r/o)*2+1,this._dollyDirection.set(this._mouse.x,this._mouse.y,1).unproject(this.object).sub(this.object.position).normalize()}_clampDistance(t){return Math.max(this.minDistance,Math.min(this.maxDistance,t))}_handleMouseDownRotate(t){this._rotateStart.set(t.clientX,t.clientY)}_handleMouseDownDolly(t){this._updateZoomParameters(t.clientX,t.clientX),this._dollyStart.set(t.clientX,t.clientY)}_handleMouseDownPan(t){this._panStart.set(t.clientX,t.clientY)}_handleMouseMoveRotate(t){this._rotateEnd.set(t.clientX,t.clientY),this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(qe*this._rotateDelta.x/e.clientHeight),this._rotateUp(qe*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd),this.update()}_handleMouseMoveDolly(t){this._dollyEnd.set(t.clientX,t.clientY),this._dollyDelta.subVectors(this._dollyEnd,this._dollyStart),this._dollyDelta.y>0?this._dollyOut(this._getZoomScale(this._dollyDelta.y)):this._dollyDelta.y<0&&this._dollyIn(this._getZoomScale(this._dollyDelta.y)),this._dollyStart.copy(this._dollyEnd),this.update()}_handleMouseMovePan(t){this._panEnd.set(t.clientX,t.clientY),this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd),this.update()}_handleMouseWheel(t){this._updateZoomParameters(t.clientX,t.clientY),t.deltaY<0?this._dollyIn(this._getZoomScale(t.deltaY)):t.deltaY>0&&this._dollyOut(this._getZoomScale(t.deltaY)),this.update()}_handleKeyDown(t){let e=!1;switch(t.code){case this.keys.UP:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(qe*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,this.keyPanSpeed),e=!0;break;case this.keys.BOTTOM:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateUp(-qe*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(0,-this.keyPanSpeed),e=!0;break;case this.keys.LEFT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(qe*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(this.keyPanSpeed,0),e=!0;break;case this.keys.RIGHT:t.ctrlKey||t.metaKey||t.shiftKey?this.enableRotate&&this._rotateLeft(-qe*this.keyRotateSpeed/this.domElement.clientHeight):this.enablePan&&this._pan(-this.keyPanSpeed,0),e=!0;break}e&&(t.preventDefault(),this.update())}_handleTouchStartRotate(t){if(this._pointers.length===1)this._rotateStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._rotateStart.set(n,s)}}_handleTouchStartPan(t){if(this._pointers.length===1)this._panStart.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panStart.set(n,s)}}_handleTouchStartDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyStart.set(0,r)}_handleTouchStartDollyPan(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enablePan&&this._handleTouchStartPan(t)}_handleTouchStartDollyRotate(t){this.enableZoom&&this._handleTouchStartDolly(t),this.enableRotate&&this._handleTouchStartRotate(t)}_handleTouchMoveRotate(t){if(this._pointers.length==1)this._rotateEnd.set(t.pageX,t.pageY);else{let n=this._getSecondPointerPosition(t),s=.5*(t.pageX+n.x),r=.5*(t.pageY+n.y);this._rotateEnd.set(s,r)}this._rotateDelta.subVectors(this._rotateEnd,this._rotateStart).multiplyScalar(this.rotateSpeed);let e=this.domElement;this._rotateLeft(qe*this._rotateDelta.x/e.clientHeight),this._rotateUp(qe*this._rotateDelta.y/e.clientHeight),this._rotateStart.copy(this._rotateEnd)}_handleTouchMovePan(t){if(this._pointers.length===1)this._panEnd.set(t.pageX,t.pageY);else{let e=this._getSecondPointerPosition(t),n=.5*(t.pageX+e.x),s=.5*(t.pageY+e.y);this._panEnd.set(n,s)}this._panDelta.subVectors(this._panEnd,this._panStart).multiplyScalar(this.panSpeed),this._pan(this._panDelta.x,this._panDelta.y),this._panStart.copy(this._panEnd)}_handleTouchMoveDolly(t){let e=this._getSecondPointerPosition(t),n=t.pageX-e.x,s=t.pageY-e.y,r=Math.sqrt(n*n+s*s);this._dollyEnd.set(0,r),this._dollyDelta.set(0,Math.pow(this._dollyEnd.y/this._dollyStart.y,this.zoomSpeed)),this._dollyOut(this._dollyDelta.y),this._dollyStart.copy(this._dollyEnd);let a=(t.pageX+e.x)*.5,o=(t.pageY+e.y)*.5;this._updateZoomParameters(a,o)}_handleTouchMoveDollyPan(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enablePan&&this._handleTouchMovePan(t)}_handleTouchMoveDollyRotate(t){this.enableZoom&&this._handleTouchMoveDolly(t),this.enableRotate&&this._handleTouchMoveRotate(t)}_addPointer(t){this._pointers.push(t.pointerId)}_removePointer(t){delete this._pointerPositions[t.pointerId];for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId){this._pointers.splice(e,1);return}}_isTrackingPointer(t){for(let e=0;e<this._pointers.length;e++)if(this._pointers[e]==t.pointerId)return!0;return!1}_trackPointer(t){let e=this._pointerPositions[t.pointerId];e===void 0&&(e=new Dt,this._pointerPositions[t.pointerId]=e),e.set(t.pageX,t.pageY)}_getSecondPointerPosition(t){let e=t.pointerId===this._pointers[0]?this._pointers[1]:this._pointers[0];return this._pointerPositions[e]}_customWheelEvent(t){let e=t.deltaMode,n={clientX:t.clientX,clientY:t.clientY,deltaY:t.deltaY};switch(e){case 1:n.deltaY*=16;break;case 2:n.deltaY*=100;break}return t.ctrlKey&&!this._controlActive&&(n.deltaY*=10),n}};function C_(i){this.enabled!==!1&&(this._pointers.length===0&&(this.domElement.setPointerCapture(i.pointerId),this.domElement.addEventListener("pointermove",this._onPointerMove),this.domElement.addEventListener("pointerup",this._onPointerUp)),!this._isTrackingPointer(i)&&(this._addPointer(i),i.pointerType==="touch"?this._onTouchStart(i):this._onMouseDown(i)))}function R_(i){this.enabled!==!1&&(i.pointerType==="touch"?this._onTouchMove(i):this._onMouseMove(i))}function P_(i){switch(this._removePointer(i),this._pointers.length){case 0:this.domElement.releasePointerCapture(i.pointerId),this.domElement.removeEventListener("pointermove",this._onPointerMove),this.domElement.removeEventListener("pointerup",this._onPointerUp),this.dispatchEvent(Ad),this.state=Qt.NONE;break;case 1:let t=this._pointers[0],e=this._pointerPositions[t];this._onTouchStart({pointerId:t,pageX:e.x,pageY:e.y});break}}function I_(i){let t;switch(i.button){case 0:t=this.mouseButtons.LEFT;break;case 1:t=this.mouseButtons.MIDDLE;break;case 2:t=this.mouseButtons.RIGHT;break;default:t=-1}switch(t){case oi.DOLLY:if(this.enableZoom===!1)return;this._handleMouseDownDolly(i),this.state=Qt.DOLLY;break;case oi.ROTATE:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Qt.PAN}else{if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Qt.ROTATE}break;case oi.PAN:if(i.ctrlKey||i.metaKey||i.shiftKey){if(this.enableRotate===!1)return;this._handleMouseDownRotate(i),this.state=Qt.ROTATE}else{if(this.enablePan===!1)return;this._handleMouseDownPan(i),this.state=Qt.PAN}break;default:this.state=Qt.NONE}this.state!==Qt.NONE&&this.dispatchEvent(ec)}function L_(i){switch(this.state){case Qt.ROTATE:if(this.enableRotate===!1)return;this._handleMouseMoveRotate(i);break;case Qt.DOLLY:if(this.enableZoom===!1)return;this._handleMouseMoveDolly(i);break;case Qt.PAN:if(this.enablePan===!1)return;this._handleMouseMovePan(i);break}}function D_(i){this.enabled===!1||this.enableZoom===!1||this.state!==Qt.NONE||(i.preventDefault(),this.dispatchEvent(ec),this._handleMouseWheel(this._customWheelEvent(i)),this.dispatchEvent(Ad))}function N_(i){this.enabled!==!1&&this._handleKeyDown(i)}function U_(i){switch(this._trackPointer(i),this._pointers.length){case 1:switch(this.touches.ONE){case li.ROTATE:if(this.enableRotate===!1)return;this._handleTouchStartRotate(i),this.state=Qt.TOUCH_ROTATE;break;case li.PAN:if(this.enablePan===!1)return;this._handleTouchStartPan(i),this.state=Qt.TOUCH_PAN;break;default:this.state=Qt.NONE}break;case 2:switch(this.touches.TWO){case li.DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchStartDollyPan(i),this.state=Qt.TOUCH_DOLLY_PAN;break;case li.DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchStartDollyRotate(i),this.state=Qt.TOUCH_DOLLY_ROTATE;break;default:this.state=Qt.NONE}break;default:this.state=Qt.NONE}this.state!==Qt.NONE&&this.dispatchEvent(ec)}function F_(i){switch(this._trackPointer(i),this.state){case Qt.TOUCH_ROTATE:if(this.enableRotate===!1)return;this._handleTouchMoveRotate(i),this.update();break;case Qt.TOUCH_PAN:if(this.enablePan===!1)return;this._handleTouchMovePan(i),this.update();break;case Qt.TOUCH_DOLLY_PAN:if(this.enableZoom===!1&&this.enablePan===!1)return;this._handleTouchMoveDollyPan(i),this.update();break;case Qt.TOUCH_DOLLY_ROTATE:if(this.enableZoom===!1&&this.enableRotate===!1)return;this._handleTouchMoveDollyRotate(i),this.update();break;default:this.state=Qt.NONE}}function O_(i){this.enabled!==!1&&i.preventDefault()}function B_(i){i.key==="Control"&&(this._controlActive=!0,this.domElement.getRootNode().addEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function z_(i){i.key==="Control"&&(this._controlActive=!1,this.domElement.getRootNode().removeEventListener("keyup",this._interceptControlUp,{passive:!0,capture:!0}))}function Cd(i){let t=new Float32Array(i.vertices.length*3);i.vertices.forEach((r,a)=>t.set(r,a*3));let e=i.vertices.length>65535?Uint32Array:Uint16Array,n=new e(i.faces.length*3);i.faces.forEach((r,a)=>n.set(r,a*3));let s=new $e;return s.setAttribute("position",new we(t,3)),s.setIndex(new we(n,1)),s.computeVertexNormals(),s.computeBoundingBox(),s.computeBoundingSphere(),s}function yo(i,t,e,n,s=new Jt){let r=new L(...bc(i,t,e,n)),a=new Ue().setFromAxisAngle(new L(0,0,1),Wn.degToRad(i.rotation_z_deg));return s.compose(r,a,new L(1,1,1))}function Rd(i,t,e,n,s){let r=0,a=new Jt,o=[];for(let l of i.parts)bn(l,t,e.layers,e.steps)&&(yo(l,e.explosion,n,s,a),i.mesh.setMatrixAt(r,a),o.push(l),r+=1);return i.mesh.count=r,i.mesh.visible=r>0,i.mesh.instanceMatrix.needsUpdate=!0,i.mesh.userData.visibleParts=o,r&&(i.mesh.computeBoundingBox(),i.mesh.computeBoundingSphere()),r}function Pd(i,t){let e=new tn,n=new Jt,s=new tn;for(let r of i.parts)yo(r,0,[0,0,0],0,n),s.copy(t(r.type_id).boundingBox).applyMatrix4(n),e.union(s);return e}function Id(i,t,e,n,s=1.18){let r=i.getCenter(new L),a=new L().crossVectors(new L(0,0,1),t).normalize(),o=new L().crossVectors(t,a).normalize(),l=Math.tan(Wn.degToRad(e)/2),c=l*n,u=0;for(let d of[i.min.x,i.max.x])for(let h of[i.min.y,i.max.y])for(let f of[i.min.z,i.max.z]){let _=new L(d,h,f).sub(r),y=_.dot(t);u=Math.max(u,Math.abs(_.dot(a))*s/c+y,Math.abs(_.dot(o))*s/l+y)}return u}var Ld={perspective:new L(270,-430,250).normalize(),front:new L(0,-1,0),side:new L(1,0,0),top:new L(0,-1e-4,1).normalize()},vo=class{constructor(t,{onSelect:e,onError:n,onViewChange:s}){this.host=t,this.onSelect=e,this.onError=n,this.onViewChange=s,this.geometries=new Map,this.batches=[],this.materials=[],this.selected=null,this.frame=null,this.disposed=!1,this.scene=new Ws,this.scene.background=new kt("#f5f6f8"),this.camera=new Ne(32,1,.1,1e4),this.camera.up.set(0,0,1),this.camera.position.set(270,-430,280),this.renderer=new mo({antialias:!0,alpha:!1,powerPreference:"high-performance"}),this.renderer.setPixelRatio(Math.min(window.devicePixelRatio||1,2)),this.renderer.outputColorSpace=ze,this.renderer.toneMapping=Ea,this.renderer.toneMappingExposure=1.12,this.renderer.shadowMap.enabled=!0,this.renderer.shadowMap.type=_a,this.renderer.shadowMap.autoUpdate=!1;let r=this.renderer.domElement;r.tabIndex=0,r.setAttribute("role","img"),r.setAttribute("aria-label","\u30D6\u30EA\u30C3\u30AF\u306E3D\u30E2\u30C7\u30EB\u3002\u30C9\u30E9\u30C3\u30B0\u3067\u56DE\u8EE2\u3001\u53F3\u30C9\u30E9\u30C3\u30B0\u3067\u79FB\u52D5\u3001\u30B9\u30AF\u30ED\u30FC\u30EB\u3067\u62E1\u5927\u3002\u77E2\u5370\u30AD\u30FC\u3067\u56DE\u8EE2\u3001Shift\u3068\u77E2\u5370\u30AD\u30FC\u3067\u79FB\u52D5\u3001\uFF0B\u3068\u2212\u3067\u62E1\u5927\u7E2E\u5C0F\u3002\u90E8\u54C1\u306F\u4E0B\u306E\u4E00\u89A7\u304B\u3089\u3082\u9078\u629E\u3067\u304D\u307E\u3059\u3002"),this.host.replaceChildren(r),this.controls=new xo(this.camera,r),this.motionQuery=window.matchMedia("(prefers-reduced-motion: reduce)"),this.controls.enableDamping=!this.motionQuery.matches,this.controls.dampingFactor=.11,this.controls.screenSpacePanning=!0,this.controls.rotateSpeed=.7,this.controls.zoomSpeed=.85,this.controls.maxPolarAngle=Math.PI*.98,this.controls.target.set(0,0,90),this.controls.minDistance=8,this.controls.maxDistance=2500,this.controls.addEventListener("change",()=>this.requestRender()),this.controls.addEventListener("start",()=>{this.currentView=null,this.onViewChange(null)}),this.motionChanged=()=>{this.controls.enableDamping=!this.motionQuery.matches},this.motionQuery.addEventListener("change",this.motionChanged),this.buildEnvironment(),this.raycaster=new tr,this.pointer=new Dt,this.pointerStart=null,r.addEventListener("pointerdown",a=>{this.pointerStart={x:a.clientX,y:a.clientY,button:a.button}}),r.addEventListener("pointerup",a=>this.pick(a)),r.addEventListener("keydown",a=>this.keyboardView(a)),r.addEventListener("webglcontextlost",a=>{a.preventDefault(),this.onError("3D\u63CF\u753B\u304C\u4E2D\u65AD\u3055\u308C\u307E\u3057\u305F\u3002\u518D\u8AAD\u307F\u8FBC\u307F\u3067\u5FA9\u65E7\u3067\u304D\u307E\u3059\u3002\u90E8\u54C1\u4E00\u89A7\u30FB\u69CB\u6210\u8868\u306F\u5F15\u304D\u7D9A\u304D\u78BA\u8A8D\u3067\u304D\u307E\u3059\u3002")}),this.resizeObserver=new ResizeObserver(()=>{let{width:a,height:o}=t.getBoundingClientRect();a<=0||o<=0||(this.renderer.setSize(a,o,!1),this.camera.aspect=a/o,this.camera.updateProjectionMatrix(),this.manifest&&this.currentView&&this.setView(this.currentView),this.requestRender())}),this.resizeObserver.observe(t),this.requestRender()}buildEnvironment(){let t=new js("#ffffff","#c4c9d3",2.5);t.position.set(0,0,1),this.scene.add(t),this.keyLight=new Ti("#fff9f1",3.2),this.keyLight.position.set(-150,-230,390),this.keyLight.castShadow=!0,this.keyLight.shadow.mapSize.set(2048,2048),this.keyLight.shadow.normalBias=.16,this.keyLight.shadow.bias=-8e-5,this.keyLight.shadow.camera.near=1,this.keyLight.shadow.camera.far=2e3,this.scene.add(this.keyLight,this.keyLight.target);let e=new Ti("#e9f1ff",1.9);e.position.set(160,90,230),this.scene.add(e);let n=new Ti("#ffffff",.7);n.position.set(120,-300,80),this.scene.add(n),this.floor=new Te(new wi(6e3,6e3),new ls({color:"#f5f6f8",roughness:1,metalness:0})),this.floor.position.z=-.2,this.floor.receiveShadow=!0,this.scene.add(this.floor);let s=new er(360,36,"#cdd3de","#dce1e9");s.rotation.x=Math.PI/2,s.position.z=-.15,s.material.transparent=!0,s.material.opacity=.38,s.material.depthWrite=!1,this.grid=s,this.scene.add(s),this.model=new Fn,this.scene.add(this.model),this.highlightMaterial=new Si({color:"#f18c32",transparent:!0,opacity:.5,polygonOffset:!0,polygonOffsetFactor:-2,polygonOffsetUnits:-2,depthWrite:!1}),this.emptyGeometry=new $e,this.highlight=new Te(this.emptyGeometry,this.highlightMaterial),this.highlight.visible=!1,this.scene.add(this.highlight)}geometryFor(t){return this.geometries.has(t)||this.geometries.set(t,Cd(this.prototypes.types[t])),this.geometries.get(t)}load(t,e,n){yc(t,e),this.clear(),this.prototypes!==e&&(this.geometries.forEach(r=>r.dispose()),this.geometries.clear()),this.manifest=t,this.prototypes=e,this.index=n,this.progress={layers:n.layers.length,steps:n.steps.length,explosion:0};let s=new Map;for(let r of n.groups.values()){if(!s.has(r.colorId)){let o=new ls({color:t.palette[r.colorId].hex,roughness:.36,metalness:.015,flatShading:!0});s.set(r.colorId,o),this.materials.push(o)}let a=new $s(this.geometryFor(r.typeId),s.get(r.colorId),r.parts.length);a.instanceMatrix.setUsage(Il),a.castShadow=!0,a.receiveShadow=!0,a.name=`${r.typeId}/${r.colorId}`,this.batches.push({mesh:a,parts:r.parts}),this.model.add(a)}this.baseBounds=Pd(t,r=>this.geometryFor(r)),this.center=this.baseBounds.getCenter(new L).toArray(),this.layerMm=t.types[t.parts[0].type_id].layer_mm,this.floor.position.z=this.baseBounds.min.z-.2,this.grid.position.set(this.center[0],this.center[1],this.baseBounds.min.z-.15),this.fitBounds=this.baseBounds.clone(),this.setProgress(this.progress),this.setView("perspective"),this.host.dataset.modelReady="true",this.host.dataset.candidate=t.candidate_id,this.host.dataset.batches=String(this.batches.length),this.host.dataset.prototypeGeometries=String(this.geometries.size)}setProgress(t){if(!this.manifest)return 0;let e=this.progress.explosion;this.progress={...t};let n=0;for(let s of this.batches)n+=Rd(s,this.index,t,this.center,this.layerMm);if(t.explosion!==e){let s=this.fitBounds.getSize(new L).length();this.fitBounds.copy(this.baseBounds);for(let o of["x","y"]){let l=o==="x"?this.center[0]:this.center[1];this.fitBounds.min[o]=l+(this.baseBounds.min[o]-l)*(1+t.explosion*.36),this.fitBounds.max[o]=l+(this.baseBounds.max[o]-l)*(1+t.explosion*.36)}this.fitBounds.min.z+=this.index.layers[0]*this.layerMm*t.explosion*1.75,this.fitBounds.max.z+=this.index.layers.at(-1)*this.layerMm*t.explosion*1.75;let r=this.fitBounds.getSize(new L).length()/s,a=this.camera.position.clone().sub(this.controls.target).multiplyScalar(r);this.controls.target.copy(this.fitBounds.getCenter(new L)),this.camera.position.copy(this.controls.target).add(a),this.controls.update()}return this.updateLighting(),this.updateHighlight(),this.host.dataset.visibleParts=String(n),this.host.dataset.explosion=String(t.explosion),this.renderer.shadowMap.needsUpdate=!0,this.requestRender(),n}updateLighting(){let t=this.fitBounds.getCenter(new L),e=this.fitBounds.getSize(new L).length()/2;this.keyLight.target.position.copy(t),this.keyLight.position.copy(t).add(new L(-e*2,-e*3,e*4));let n=this.keyLight.shadow.camera;n.left=-e*1.5,n.right=e*1.5,n.top=e*1.6,n.bottom=-e*1.6,n.far=e*10+100,n.updateProjectionMatrix()}setView(t){if(!this.manifest)return;let e=this.fitBounds,n=e.getCenter(new L),s=Id(e,Ld[t],this.camera.fov,this.camera.aspect);this.camera.up.set(0,0,1),this.controls.target.copy(n),this.camera.position.copy(n).addScaledVector(Ld[t],s),this.camera.near=Math.max(.05,s/1e4),this.camera.far=Math.max(6e3,s*8),this.camera.updateProjectionMatrix(),this.controls.update(),this.currentView=t,this.onViewChange(t),this.requestRender()}select(t){this.selected=t,this.updateHighlight(),this.requestRender()}updateHighlight(){let t=this.selected;this.highlight.visible=!!(t&&this.manifest&&bn(t,this.index,this.progress.layers,this.progress.steps)),this.highlight.visible&&(this.highlight.geometry=this.geometryFor(t.type_id),this.highlight.matrixAutoUpdate=!1,yo(t,this.progress.explosion,this.center,this.layerMm,this.highlight.matrix),this.highlight.matrixWorldNeedsUpdate=!0)}focusPart(){if(!this.highlight.visible)return;let e=this.highlight.geometry.boundingBox.clone().applyMatrix4(this.highlight.matrix),n=e.getCenter(new L),s=Math.max(e.getSize(new L).length()*4,40),r=this.camera.position.clone().sub(this.controls.target).normalize();this.controls.target.copy(n),this.camera.position.copy(n).addScaledVector(r,s),this.currentView=null,this.onViewChange(null),this.controls.update(),this.requestRender()}pick(t){let e=this.pointerStart;if(this.pointerStart=null,!e||e.button!==0||!this.manifest||Math.hypot(t.clientX-e.x,t.clientY-e.y)>5)return;let n=this.host.getBoundingClientRect();this.pointer.set((t.clientX-n.left)/n.width*2-1,-(t.clientY-n.top)/n.height*2+1),this.raycaster.setFromCamera(this.pointer,this.camera);let s=this.raycaster.intersectObjects(this.batches.filter(r=>r.mesh.visible).map(r=>r.mesh),!1);if(s.length){let r=s[0],a=r.object.userData.visibleParts[r.instanceId];a&&this.onSelect(a.id)}}keyboardView(t){if(!this.manifest||!["ArrowLeft","ArrowRight","ArrowUp","ArrowDown","+","=","-","Escape","Home"].includes(t.key))return;if(t.preventDefault(),t.key==="Escape"){this.onSelect(null);return}if(t.key==="Home"){this.setView("perspective");return}let n=this.camera.position.clone().sub(this.controls.target);if(t.key==="+"||t.key==="="||t.key==="-"){let s=t.key==="-"?1.12:.88,r=Wn.clamp(n.length()*s,this.controls.minDistance,this.controls.maxDistance);n.setLength(r),this.camera.position.copy(this.controls.target).add(n)}else if(t.shiftKey){let s=n.length()*.025,r=new L().setFromMatrixColumn(this.camera.matrix,0),a=new L().setFromMatrixColumn(this.camera.matrix,1),o=t.key==="ArrowLeft"?r.multiplyScalar(-s):t.key==="ArrowRight"?r.multiplyScalar(s):t.key==="ArrowUp"?a.multiplyScalar(s):a.multiplyScalar(-s);this.controls.target.add(o),this.camera.position.add(o)}else{let s=new Ue().setFromUnitVectors(new L(0,0,1),new L(0,1,0)),r=new ai().setFromVector3(n.applyQuaternion(s));t.key==="ArrowLeft"&&(r.theta-=.1),t.key==="ArrowRight"&&(r.theta+=.1),t.key==="ArrowUp"&&(r.phi-=.1),t.key==="ArrowDown"&&(r.phi+=.1),r.phi=Wn.clamp(r.phi,.01,Math.PI*.98),n.setFromSpherical(r).applyQuaternion(s.invert()),this.camera.position.copy(this.controls.target).add(n)}this.currentView=null,this.onViewChange(null),this.controls.update(),this.requestRender()}requestRender(){this.disposed||this.frame!==null||(this.frame=requestAnimationFrame(()=>{if(this.frame=null,this.disposed)return;let t=this.controls.update();try{this.renderer.render(this.scene,this.camera)}catch{this.onError("3D\u63CF\u753B\u306B\u5931\u6557\u3057\u307E\u3057\u305F\u3002\u518D\u8AAD\u307F\u8FBC\u307F\u3059\u308B\u304B\u3001WebGL\u5BFE\u5FDC\u306E\u30D6\u30E9\u30A6\u30B6\u30FC\u3067\u958B\u3044\u3066\u304F\u3060\u3055\u3044\u3002");return}t&&this.controls.enableDamping&&this.requestRender()}))}clear(){this.batches.forEach(({mesh:t})=>{this.model.remove(t),t.dispose()}),this.materials.forEach(t=>t.dispose()),this.batches=[],this.materials=[],this.selected=null,this.manifest=null,this.highlight.visible=!1,this.host.dataset.modelReady="false",this.host.dataset.visibleParts="0",this.requestRender()}dispose(){this.clear(),this.disposed=!0,this.frame!==null&&cancelAnimationFrame(this.frame),this.resizeObserver.disconnect(),this.motionQuery.removeEventListener("change",this.motionChanged),this.controls.dispose(),this.geometries.forEach(t=>t.dispose()),this.highlightMaterial.dispose(),this.emptyGeometry.dispose(),this.floor.geometry.dispose(),this.floor.material.dispose(),this.grid.geometry.dispose(),this.grid.material.dispose(),this.keyLight.shadow.dispose(),this.renderer.dispose(),this.host.replaceChildren()}};var k_="/artifacts/selected/current.json",bo="/artifacts/phase1/catalog.json",Ae=(i,t)=>{if(!i)throw new Se(t)},Mo=i=>i!==null&&typeof i=="object"&&!Array.isArray(i);function Dd(i){Ae(Mo(i)&&i.schema_version===1&&typeof i.revision=="string"&&/^[a-zA-Z0-9][a-zA-Z0-9._-]*$/.test(i.revision),"\u5916\u89B3\u57FA\u6E96\u306E\u9078\u629E\u8A18\u9332\u304C\u4E0D\u6B63\u3067\u3059\u3002"),Ae(Array.isArray(i.selections)&&i.selections.length===3,"3\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u306E\u9078\u629E\u8A18\u9332\u304C\u5FC5\u8981\u3067\u3059\u3002");let t=new Set;for(let n of i.selections)Ae(Mo(n)&&["mona","copilot","ducky"].includes(n.character)&&["chunky","balanced","fine"].includes(n.style)&&n.candidate_id===`${n.character}-${n.style}`&&n.visual_decision==="APPROVED"&&Number.isFinite(n.pitch_mm)&&n.pitch_mm>0&&Number.isFinite(n.layer_mm)&&n.layer_mm>0&&Number.isSafeInteger(n.baseline_part_count)&&n.baseline_part_count>0&&/^[0-9a-f]{64}$/i.test(n.baseline_sha256),"\u5916\u89B3\u57FA\u6E96\u306EID\u30FB\u9078\u629E\u7BC4\u56F2\u30FB\u6570\u5024\u304C\u4E0D\u6B63\u3067\u3059\u3002"),Ae(!t.has(n.character),"\u5916\u89B3\u57FA\u6E96\u306E\u30AD\u30E3\u30E9\u30AF\u30BF\u30FC\u304C\u91CD\u8907\u3057\u3066\u3044\u307E\u3059\u3002"),t.add(n.character),Ae(Ie(n.baseline_manifest).startsWith("/artifacts/phase1/"),"\u5916\u89B3\u57FA\u6E96\u306FPhase1\u306E\u8A18\u9332\u3092\u53C2\u7167\u3059\u308B\u5FC5\u8981\u304C\u3042\u308A\u307E\u3059\u3002");let e=i.gates;return Ae(Mo(e)&&e.visual_baseline==="APPROVED"&&e.revised_joint_fit==="UNKNOWN"&&e.retention_strength==="UNKNOWN"&&e.physical_assembly==="UNKNOWN"&&e.production_export==="BLOCKED","\u5916\u89B3\u57FA\u6E96\u306E\u9078\u629E\u3092\u88FD\u9020\u627F\u8A8D\u3068\u89E3\u91C8\u3067\u304D\u307E\u305B\u3093\u3002\u5B9F\u6A5F\u691C\u8A3C\u30FB\u91CF\u7523\u30B2\u30FC\u30C8\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002"),i}function Nd(i){return Ae(Mo(i)&&i.selection_url===Ui,"\u9078\u629E\u7248\u30DD\u30A4\u30F3\u30BF\u30FC\u306E\u9078\u629E\u8A18\u9332\u53C2\u7167\u5148\u304C\u4E0D\u6B63\u3067\u3059\u3002"),cn(i.catalog_url,i.revision),i}function V_(i,t,e){Ae(i&&i.character===t.character&&i.style===t.style&&i.pitch_mm===t.pitch_mm&&i.layer_mm===t.layer_mm,"\u516C\u958B\u6848\u304C\u30E6\u30FC\u30B6\u30FC\u306E\u5916\u89B3\u57FA\u6E96\u9078\u629E\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002"),Ae((e?i.metrics.baseline_part_count:i.metrics.part_count)===t.baseline_part_count,"\u5916\u89B3\u57FA\u6E96\u306E\u90E8\u54C1\u6570\u304C\u9078\u629E\u8A18\u9332\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002")}function nc(i,t,e=null,{preview:n=!1}={}){Dd(i),Io(t);let s=e!==null;s&&(Nd(e),Ae(e.revision===i.revision&&t.revision===e.revision&&t.stage===Es&&t.selection_url===Ui,"\u9078\u629E\u8A18\u9332\u30FB\u516C\u958B\u30DD\u30A4\u30F3\u30BF\u30FC\u30FB\u8A66\u4F5C\u7248\u306Erevision\u304C\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002"));let r=i.selections.map(a=>{let o=t.candidates.find(l=>l.id===a.candidate_id);return V_(o,a,s),o});return s&&Ae(t.candidates.length===r.length,"\u9078\u629E\u7248\u306B\u672A\u9078\u629E\u306E\u6848\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u3002"),{kind:s?n?"preview":"selected":"baseline",revision:i.revision,selection:i,catalog:s?t:{...t,candidates:r},catalogURL:s?e.catalog_url:bo,statusURL:s?"/archive/status.json":null}}async function Ud({mode:i,previewRevision:t=null,readJSON:e,readOptionalJSON:n}){if(i==="phase1")return{kind:"phase1",revision:"phase1",selection:null,catalog:Io(await e(bo)),catalogURL:bo,statusURL:"/archive/status.json"};let s=Dd(await e(Ui));if(t!==null){let o=cn(`/artifacts/selected/${t}/catalog.json`,t);Ae(t===s.revision,"\u7248\u6307\u5B9A\u30D7\u30EC\u30D3\u30E5\u30FC\u304C\u73FE\u5728\u306E\u5916\u89B3\u57FA\u6E96\u9078\u629E\u306Erevision\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");let l={revision:t,catalog_url:o,selection_url:Ui};return nc(s,await e(o),l,{preview:!0})}let r=await n(k_);if(r===null)return nc(s,await e(bo));let a=Nd(r);return nc(s,await e(a.catalog_url),a)}function Fd(i,t){if(t.kind==="phase1"){Ae(i.schema_version===1,"Phase1\u5C65\u6B74\u306B\u5225\u7248\u306E\u914D\u7F6E\u30C7\u30FC\u30BF\u304C\u542B\u307E\u308C\u3066\u3044\u307E\u3059\u3002");return}let e=t.selection.selections.find(n=>n.candidate_id===i.candidate_id);Ae(e,"\u914D\u7F6E\u30C7\u30FC\u30BF\u304C\u5916\u89B3\u57FA\u6E96\u306E\u9078\u629E\u306B\u542B\u307E\u308C\u3066\u3044\u307E\u305B\u3093\u3002");for(let n of new Set(i.parts.map(s=>s.type_id))){let s=i.types[n];Ae(s.pitch_mm===e.pitch_mm&&s.layer_mm===e.layer_mm,"\u914D\u7F6E\u90E8\u54C1\u306E\u683C\u5B50\u304C\u9078\u629E\u6E08\u307F\u5916\u89B3\u57FA\u6E96\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002")}t.kind==="baseline"?Ae(i.schema_version===1&&i.metrics.part_count===e.baseline_part_count,"\u57FA\u6E96\u8868\u793A\u306B\u65B0\u3057\u3044\u8A66\u4F5C\u7248\u306E\u914D\u7F6E\u30C7\u30FC\u30BF\u304C\u6DF7\u5728\u3057\u3066\u3044\u307E\u3059\u3002"):Ae(i.schema_version===2&&i.metrics.baseline_part_count===e.baseline_part_count&&i.visual_approval.baseline_manifest_sha256.toLowerCase()===e.baseline_sha256.toLowerCase()&&(i.revision===void 0||i.revision===t.revision),"\u65B0\u3057\u3044\u8A66\u4F5C\u7248\u306E\u5916\u89B3\u57FA\u6E96\u30CF\u30C3\u30B7\u30E5\u30FBrevision\u304C\u9078\u629E\u8A18\u9332\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002")}function ic(i){let t=i.kind==="phase1",e=i.kind==="baseline",n=i.kind==="preview";if(document.body.dataset.viewMode=i.kind,A("#selected-mode-link").setAttribute("aria-current",t||n?"false":"page"),A("#history-mode-link").setAttribute("aria-current",t?"page":"false"),A("#phase1-gallery-link").href=Sn(Ie(i.catalog?.source_history_url??"/artifacts/phase1/gallery.html")),A(".style-switch").hidden=!t,A(".gallery-columns").hidden=!t,A("#phase-label").textContent=t?"PHASE 1 \xB7 \u5C65\u6B74":e?"\u9078\u629E\u57FA\u6E96":n?"PHASE 2 \xB7 \u7248\u6307\u5B9A":"PHASE 2 \xB7 \u8A66\u4F5C",A("#visual-gate").textContent=t?"\u5916\u89B3\u691C\u8A0E":"\u5916\u89B3\u57FA\u6E96\u306F\u9078\u629E\u6E08\u307F",A("#assembly-gate").hidden=t,A("#physical-gate").textContent=t?"\u65E7\u7248\u30FB\u5B9F\u7269\u5408\u683C\u306E\u8A18\u9332\u3067\u306F\u306A\u3044":"\u521D\u56DE\u8A66\u4F5C\u3067\u8AB2\u984C\u30FB\u4FDD\u6301\u529B\u672A\u78BA\u8A8D",A("#production-gate").textContent="\u5168\u6570\u5370\u5237\u306F\u4FDD\u7559",A("#revision-id").textContent=t?"Phase1 / historical":`${i.revision}${e?" / \u516C\u958B\u5F85\u3061":n?" / PREVIEW":""}`,A("#revision-title").textContent=t?"Phase1\u306E\u6BD4\u8F03\u5C65\u6B74\u30FB\u65E7\u63A5\u5408\u90E8":e?"\u5916\u89B3\u57FA\u6E96\u306F\u9078\u629E\u6E08\u307F\u30FB\u65B0\u63A5\u5408\u90E8\u7248\u306F\u672A\u516C\u958B":n?"\u7248\u6307\u5B9A\u30D7\u30EC\u30D3\u30E5\u30FC\u30FB\u516C\u958B\u72B6\u614B\u3092\u793A\u3059\u3082\u306E\u3067\u306F\u3042\u308A\u307E\u305B\u3093":"\u9078\u629E\u6E08\u307F\u306E\u5916\u89B3\u57FA\u6E96\u3092\u5F15\u304D\u7D99\u3050\u63A5\u5408\u90E8\u8A66\u4F5C\u7248",A("#revision-detail").textContent=t?"\u5F53\u6642\u306E9\u6848\u3068\u65E7\u5F62\u72B6\u3092\u6B8B\u3057\u305F\u5C65\u6B74\u3067\u3059\u3002\u73FE\u5728\u306E\u63A5\u5408\u90E8\u8A66\u4F5C\u3084\u88FD\u9020\u306E\u627F\u8A8D\u3092\u793A\u3057\u307E\u305B\u3093\u3002":e?"\u516C\u958B\u30DD\u30A4\u30F3\u30BF\u30FC\u304C\u307E\u3060\u3042\u308A\u307E\u305B\u3093\u3002\u4EE5\u4E0B\u306F\u9078\u629E\u6E08\u307F\u306EPhase1\u57FA\u6E96\u5F62\u72B6\u30FB\u57FA\u6E96\u90E8\u54C1\u6570\u3067\u3059\u3002\u65B0\u7248\u306ECAD\u30FB\u58C1\u539A\u6539\u5584\u30FB\u7D44\u7ACB\u691C\u8A3C\u304C\u5B58\u5728\u3059\u308B\u3068\u306F\u5224\u65AD\u3057\u3066\u3044\u307E\u305B\u3093\u3002":n?"URL\u3067\u660E\u793A\u3055\u308C\u305F\u8A66\u4F5C\u7248\u3092\u76F4\u63A5\u8AAD\u307F\u53D6\u3063\u3066\u3044\u307E\u3059\u3002\u516C\u958B\u30DD\u30A4\u30F3\u30BF\u30FC\u7D4C\u7531\u306E\u901A\u5E38\u8868\u793A\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u8CC7\u6599\u306F\u691C\u8A0E\u7528\u30FB\u5DEE\u66FF\u3048\u4E2D\u3067\u3059\u3002\u88DC\u52A9\u5177\u6761\u4EF6\u306F\u73FE\u5728\u306E\u914D\u7F6E\u30DE\u30CB\u30D5\u30A7\u30B9\u30C8\u3092\u53C2\u7167\u3057\u3001\u5B9F\u6A5F\u5D4C\u5408\u30FB\u4FDD\u6301\u529B\u30FB\u88FD\u9020\u306F\u672A\u627F\u8A8D\u306E\u307E\u307E\u3067\u3059\u3002":"\u9078\u629E\u6E08\u307F\u306A\u306E\u306FPhase1\u306E\u5916\u89B3\u57FA\u6E96\u3060\u3051\u3067\u3059\u3002\u3053\u306E\u7248\u306E\u63A5\u5408\u90E8\u3068\u7D44\u7ACB\u306F\u8A66\u4F5C\u6BB5\u968E\u3067\u3001\u5B9F\u6A5F\u5D4C\u5408\u30FB\u4FDD\u6301\u529B\u30FB\u88FD\u9020\u306F\u672A\u627F\u8A8D\u3067\u3059\u3002",A("#revision-notice").dataset.kind=i.kind,A("#selection-summary").replaceChildren(),i.selection)for(let s of i.selection.selections)A("#selection-summary").append(U("li","",`${hn[s.character].name} \xB7 ${Pn[s.style].english} ${ut(s.pitch_mm)} mm / \u57FA\u6E96 ${ut(s.baseline_part_count,0)}\u500B`));A("#comparison-kicker").textContent=t?"PHASE 1 \xB7 HISTORICAL COMPARISON":e?"APPROVED EXTERIOR BASELINES \xB7 OLD GEOMETRY":n?"EXPLICIT REVISION PREVIEW \xB7 NOT A RELEASE":"SELECTED PROTOTYPE \xB7 CURRENT REVISION",A("#comparison-copy").textContent=t?"\u5F53\u6642\u306E\u90E8\u54C1\u6570\u30FB\u753B\u50CF\u30FB\u63A5\u5408\u90E8\u306E\u6BD4\u8F03\u3067\u3059\u3002\u65E7\u7D30\u5BC6\u58C1\u539A\u306E\u6CE8\u610F\u4E8B\u9805\u306F\u3053\u306E\u65E7\u7248\u306E\u60C5\u5831\u3067\u3059\u3002":e?"\u9078\u629E\u6E08\u307F3\u6848\u306E\u57FA\u6E96\u753B\u50CF\u3067\u3059\u3002\u65B0\u3057\u3044\u63A5\u5408\u90E8\u306E\u753B\u50CF\u30FB\u52D5\u753B\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002":"\u3053\u306E\u8A66\u4F5C\u7248\u306E\u5B9F\u751F\u6210\u753B\u50CF\u3060\u3051\u3092\u8868\u793A\u3057\u307E\u3059\u3002\u672A\u751F\u6210\u306E\u753B\u50CF\u30FB\u52D5\u753B\u3092\u904E\u53BB\u7248\u3067\u7F6E\u304D\u63DB\u3048\u307E\u305B\u3093\u3002",A("#selection-note-title").textContent=t?"\u73FE\u5728\u306E\u5916\u89B3\u57FA\u6E96\u306F\u3001\u5225\u306E\u9078\u629E\u8A18\u9332\u306B\u4FDD\u5B58\u3055\u308C\u3066\u3044\u307E\u3059\u3002":"\u5916\u89B3\u57FA\u6E96\u306E\u9078\u629E\u306F\u3001\u88FD\u9020\u627F\u8A8D\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",A("#selection-note-copy").textContent="\u3053\u306E\u753B\u9762\u306F\u8868\u793A\u5207\u66FF\u3068\u30D5\u30A1\u30A4\u30EB\u306E\u8AAD\u307F\u53D6\u308A\u3060\u3051\u3067\u3059\u3002CAD\u751F\u6210\u30FB\u30D7\u30EA\u30F3\u30BF\u30FC\u63A5\u7D9A\u30FB\u9001\u4FE1\u30FB\u627F\u8A8D\u64CD\u4F5C\u306F\u884C\u3044\u307E\u305B\u3093\u3002",A("#visual-selection-status").textContent=t?"\u5F53\u6642\u306E\u672A\u78BA\u5B9A\u8A18\u9332":"\u9078\u629E\u6E08\u307F\u30FB\u5916\u89B3\u57FA\u6E96\u306E\u307F",A("#downloads-title").textContent=e?"\u57FA\u6E96\u30C7\u30FC\u30BF\uFF08Phase1\u65E7\u7248\uFF09":t?"Phase1\u5C65\u6B74\u30C7\u30FC\u30BF":n?"\u7248\u6307\u5B9A\u306E\u691C\u8A0E\u8CC7\u6599\u30FB\u5DEE\u66FF\u3048\u4E2D":"\u3053\u306E\u8A66\u4F5C\u7248\u306E\u691C\u8A0E\u30C7\u30FC\u30BF",A("#downloads-scope").textContent=e?"\u4EE5\u4E0B\u306F\u65E7\u63A5\u5408\u90E8\u306E\u5916\u89B3\u57FA\u6E96\u30C7\u30FC\u30BF\u3067\u3059\u3002\u65B0\u7248\u306E\u8A66\u9A13\u7247\u30FBCAD\u30FB\u52D5\u753B\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002":"\u516C\u958B\u7528\u30E1\u30BF\u30C7\u30FC\u30BF\u6574\u7406\u6E08\u307F\u306E\u30D5\u30A1\u30A4\u30EB\u3067\u3059\u3002\u7D44\u7ACBFCStd\u306F\u90E8\u54C1\u30E9\u30A4\u30D6\u30E9\u30EA\u30FC\u304C\u5FC5\u8981\u306A\u305F\u3081\u3001\u914D\u5E03\u30AB\u30BF\u30ED\u30B0\u306ECAD\u4E00\u5F0FZIP\u3092\u63A8\u5968\u3057\u307E\u3059\u3002\u5168\u6570\u5370\u5237\u306F\u4FDD\u7559\u3067\u3059\u3002",A("#footer-scope").textContent=t?"PHASE 1 \xB7 \u6BD4\u8F03\u5C65\u6B74":`${i.revision} \xB7 \u5916\u89B3\u57FA\u6E96\u306E\u307F\u9078\u629E\u6E08\u307F`}function Od(i,t="\u672A\u8A18\u8F09\u30FB\u672A\u78BA\u8A8D"){return typeof i=="string"?i:Array.isArray(i)&&i.every(e=>typeof e=="string")?i.join(" / "):t}function Bd(i){return new URL(i,"http://local.invalid").pathname.split(".").at(-1).toUpperCase()}async function H_(i,t,e,n,s){if(!i.layout_url)return;let r=U("p","control-help","\u914D\u7F6E\u8CC7\u6599\u306E\u59FF\u52E2\u30FB\u6570\u91CF\u3092\u78BA\u8A8D\u4E2D\u3067\u3059\u3002");t.append(r);try{let a=await $n(cn(i.layout_url,s),n);if(n.aborted||!r.isConnected)return;let o=i.parts.filter(h=>!h.optional).reduce((h,f)=>h+f.quantity,0);if(a.pitch_mm!==i.pitch_mm||a.piece_count!==o)throw new Se("\u914D\u7F6E\u8CC7\u6599\u306E\u30D4\u30C3\u30C1\u307E\u305F\u306F\u500B\u6570\u304C\u30AB\u30BF\u30ED\u30B0\u3068\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002");let l=Array.isArray(a.instructions)?a.instructions.filter(h=>typeof h=="string"):[],c=l.some(h=>/female receiver.*socket DOWN/i.test(h)),u=l.some(h=>/male grip.*stem UP/i.test(h));c&&u&&(e.textContent="\u53D7\u3051\u5074\uFF1A\u30BD\u30B1\u30C3\u30C8\u4E0B\u5411\u304D\u30FB\u5E95\u9762z=0\u3002\u96C4\u5074\uFF1A\u5EA7\u9762\u3068\u8EF8\u3092\u4E0A\u5411\u304D\uFF08\u8CC7\u6599\u306E\u6307\u5B9A\u30FB\u5B9F\u6A5F\u672A\u78BA\u8A8D\uFF09\u3002");let d=Number.isSafeInteger(a.document_object_count)?`${ut(a.document_object_count,0)}\u500B\u306ECAD\u5185\u90E8\u30AA\u30D6\u30B8\u30A7\u30AF\u30C8`:"CAD\u306E\u69CB\u7BC9\u5C65\u6B74";r.textContent=`${d}\u3092\u3059\u3079\u3066\u51FA\u529B\u3059\u308B\u6307\u793A\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u5BFE\u8C61\u306F${i.parts.length}\u7A2E\u30FB\u6307\u5B9A\u6570\u91CF${ut(o,0)}\u500B\u3001\u307E\u305F\u306F\u305D\u306E\u914D\u7F6E\u30D5\u30A1\u30A4\u30EB\u3067\u3059\u3002\u30B9\u30E9\u30A4\u30B9\u30FB\u6642\u9593\u30FB\u8CEA\u91CF\u30FB\u5B9F\u6A5F\u9069\u5408\u306F\u672A\u78BA\u8A8D\u3067\u3059\u3002`,l.some(h=>/negative-clearance.*intentionally interferes/i.test(h))&&r.append(U("span","trial-negative-clearance"," \u22120.05 mm\u306F\u610F\u56F3\u7684\u306A\u5E72\u6E09\u6761\u4EF6\u3067\u3059\u3002\u885D\u7A81\u306A\u3057\u30FB\u9069\u5408\u6E08\u307F\u3068\u306F\u89E3\u91C8\u305B\u305A\u3001\u672A\u691C\u8A3C\u306E\u8EF8\u3078\u306E\u7121\u7406\u306A\u5727\u5165\u3092\u63A8\u5968\u3057\u307E\u305B\u3093\u3002"))}catch(a){if(n.aborted||!r.isConnected)return;r.textContent=`\u914D\u7F6E\u8CC7\u6599\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002${a.message}`,r.setAttribute("role","alert"),r.dataset.state="error"}}function zd(i,t){let e=A("#fit-trials");e.hidden=i.kind==="phase1";let n=A("#trial-sets");if(n.replaceChildren(),e.hidden)return;if(i.kind==="baseline"){A("#trial-summary").textContent="\u65B0\u7248\u306E\u8A66\u9A13\u7247\u306F\u672A\u516C\u958B\u3067\u3059\u3002\u8868\u793A\u4E2D\u306E\u65E7\u57FA\u6E96\u5F62\u72B6\u3084\u904E\u53BB\u306E6 mm\u8A66\u9A13\u7247\u3092\u3001\u65B0\u3057\u30444 mm\u30FB8 mm\u63A5\u5408\u90E8\u306E\u4EE3\u308F\u308A\u306B\u4F7F\u3044\u307E\u305B\u3093\u3002",n.append(U("p","section-empty","\u516C\u958B\u3055\u308C\u305F\u65B0\u7248\u30AB\u30BF\u30ED\u30B0\u306B\u8A66\u9A13\u7247\u304C\u305D\u308D\u3046\u307E\u3067\u3001\u53D6\u5F97\u30EA\u30F3\u30AF\u306F\u8868\u793A\u3057\u307E\u305B\u3093\u3002"));return}let s=i.catalog.trial_sets??[];if(!s.length){A("#trial-summary").textContent="\u3053\u306E\u8A66\u4F5C\u7248\u306E\u8A66\u9A13\u7247\u30BB\u30C3\u30C8\u306F\u672A\u516C\u958B\u3067\u3059\u3002\u672C\u4F53\u4E00\u5F0F\u3092\u51FA\u529B\u305B\u305A\u3001\u5C11\u6570\u8A66\u9A13\u7247\u306E\u516C\u958B\u3092\u5F85\u3061\u307E\u3059\u3002";return}let r=s.reduce((a,o)=>a+o.parts.filter(l=>!l.optional).reduce((l,c)=>l+c.quantity,0),0);A("#trial-summary").textContent=`\u904E\u53BB\u306B\u7528\u610F\u3057\u305F\u8A66\u9A13\u7247\u306F4 mm\uFF0F8 mm\u306E\u5408\u8A08${ut(r,0)}\u500B\u30024 mm\u306E\u521D\u56DE\u8A66\u4F5C\u3067\u306F\u5C0F\u3055\u3055\u30FB\u7A74\u8A70\u307E\u308A\u304C\u5831\u544A\u3055\u308C\u3001\u6539\u826F\u691C\u8A0E\u4E2D\u3067\u3059\u3002\u518D\u5370\u5237\u3084\u672C\u4F53\u4E00\u5F0F\u306E\u51FA\u529B\u3092\u6307\u793A\u3059\u308B\u3082\u306E\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u4EFB\u610F\u306E\u53D7\u3051\u53F0\u306F\u5225\u67A0\u3067\u3059\u3002`;for(let a of s){let o=U("section","data-card trial-set");o.dataset.pitch=String(a.pitch_mm);let l=i.catalog.candidates.filter(m=>m.pitch_mm===a.pitch_mm).map(m=>hn[m.character].name).join("\u30FB"),c=a.parts.filter(m=>!m.optional).reduce((m,p)=>m+p.quantity,0),u=U("div","card-heading");u.append(U("h3","",`${ut(a.pitch_mm)} mm \xB7 ${l}`),U("span","small-label",`${ut(c,0)}\u500B / NOT_SLICED`)),o.append(u);let d=U("dl","evidence-facts"),h,f=a.diametral_clearances_mm??a.clearances_mm,_=Array.isArray(f)&&f.every(Number.isFinite)?`${f.map(m=>`${m>0?"+":""}${ut(m,2)}`).join(" / ")} mm`:"\u540C\u68B1\u8CC7\u6599\u3067\u78BA\u8A8D";for(let[m,p]of[["\u30CE\u30BA\u30EB\u5019\u88DC",`${ut(a.nozzle_recommendation_mm)} mm\uFF08\u8A2D\u8A08\u4EEE\u5B9A\u30FB\u672A\u691C\u8A3C\uFF09`],["\u6750\u6599",Od(a.material,"PLA\u3092\u60F3\u5B9A\u30FB\u5B9F\u6A5F\u672A\u691C\u8A3C")],["\u59FF\u52E2",Od(a.orientation??a.print_orientation)],["\u76F4\u5F84\u5DEE",_],["\u30EC\u30A4\u30A2\u30A6\u30C8","\u5E7E\u4F55\u914D\u7F6E\u306E\u307F\u30FB\u30B9\u30E9\u30A4\u30B9\u672A\u78BA\u8A8D"],["\u5B9F\u6A5F\u5D4C\u5408\u30FB\u4FDD\u6301\u529B","UNKNOWN"]]){let w=U("div"),E=U("dd","",p);m==="\u59FF\u52E2"&&(h=E),w.append(U("dt","",m),E),d.append(w)}o.append(d,U("p","card-footnote","\u76F4\u5F84\u5DEE\u306F\u7A74\u5F84\u2212\u8EF8\u5F84\u3067\u3001\u7247\u5074\u306E\u9699\u9593\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002\u30CE\u30BA\u30EB\u5F84\u30FB\u58C1\u539A\u306E\u6761\u4EF6\u3060\u3051\u3067\u306F\u5F37\u5EA6\u3084\u5D4C\u5408\u3092\u4FDD\u8A3C\u3057\u307E\u305B\u3093\u3002"));let y=U("div","trial-downloads");o.append(y),n.append(o),H_(a,o,h,t,i.revision);for(let m of[...a.parts,...(a.optional_parts??[]).map(p=>({...p,optional:!0}))]){let p=cn(m.url,i.revision);xr(y,{label:`${m.optional?"\u4EFB\u610F \xB7 ":""}${m.label} \xD7 ${ut(m.quantity,0)}`,extension:Bd(p),url:p},t)}for(let[m,p]of[["native_url",`${ut(a.pitch_mm)} mm\u8A66\u9A13\u7247CAD\uFF08\u69CB\u7BC9\u5C65\u6B74\u3092\u542B\u3080\uFF09`],["plate_url",`${ut(c,0)}\u500B\u306E\u914D\u7F6E3MF\uFF08\u30B9\u30E9\u30A4\u30B9\u524D\uFF09`],["plate_stl_url",`${ut(c,0)}\u500B\u306E\u914D\u7F6ESTL\uFF08\u30B9\u30E9\u30A4\u30B9\u524D\uFF09`],["plate_step_url",`${ut(c,0)}\u500B\u306E\u914D\u7F6ESTEP\uFF08\u691C\u8A0E\u7528\uFF09`],["layout_url","\u59FF\u52E2\u30FB\u6570\u91CF\u306E\u914D\u7F6E\u8A18\u9332JSON"],["instructions_url","\u8A66\u9A13\u6761\u4EF6\u30FB\u59FF\u52E2\u306E\u8CC7\u6599\uFF08\u691C\u8A0E\u7528\uFF09"],["parts_csv_url","\u8A66\u9A13\u7247\u306E\u6570\u91CFCSV"],["csv_url","\u8A66\u9A13\u7247\u306E\u8A18\u9332CSV"]]){if(!a[m])continue;let w=cn(a[m],i.revision);xr(y,{label:p,extension:Bd(w),url:w},t)}}}var Ye=null,bs=null,ve=null,Ce=null,Ze=null,Xn=!1,So=null,xs=null,hr=null,wo=null,ys=0,me={explosion:0,layers:0,steps:0},vs=null,Eo=new URLSearchParams(window.location.search).get("mode")==="phase1"?"phase1":"selected",kd=new URLSearchParams(window.location.search).get("revision"),dr=new vr(sc),To=new _r;Eo==="phase1"&&ic({kind:"phase1",revision:"phase1",selection:null});function G_(i){Xn=!1,A("#canvas-host").dataset.modelReady="false",Oi("3D\u3092\u8868\u793A\u3067\u304D\u307E\u305B\u3093",i,!0),Bi(!!ve,!1),A("#explode").disabled=!0,A("#focus-part").disabled=!0,fi(i)}function W_(){return Ze||(Ze=new vo(A("#canvas-host"),{onSelect:sc,onError:G_,onViewChange:i=>Mn(ge("[data-view]"),t=>t.dataset.view===i)})),Ze}async function X_(){if(So)return So;if(!xs){let i=Ye,t=$n(Ie(i.prototypes_url)).then(xc).then(e=>(Ye===i&&(So=e),e)).finally(()=>{xs===t&&(xs=null)});xs=t}return xs}function Vd(){me={explosion:0,layers:0,steps:0},A("#explode").value="0",A("#explode-value").textContent="0%",A("#layers").value="0",A("#steps").value="0",A("#layer-value").textContent="\u2014 / \u2014 \u5C64",A("#step-value").textContent="\u2014 / \u2014",A("#empty-progress").hidden=!0,Bi(!1,!1)}async function Ao(i,t=!1){let e=Ye?.candidates.find(a=>a.id===i);if(!e)return;hr?.abort(),hr=new AbortController;let n=hr,s=++ys;bs=e,ve=null,Ce=null,Xn=!1,Ze?.clear(),Vd(),Fo(),dr.clear(),Pc(Ye,e,vs),Cc(i),Oi("\u5B9F\u969B\u306E\u30D6\u30EA\u30C3\u30AF\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D","\u90E8\u54C1ID\u30FB\u8272\u30FB\u914D\u7F6E\u3068\u3001CAD\u7531\u6765\u306E\u30E1\u30C3\u30B7\u30E5\u3092\u7167\u5408\u3057\u3066\u3044\u307E\u3059\u3002"),A("#viewport").setAttribute("aria-busy","true"),Rc(Ye,e,n.signal,vs),t&&A("#studio").scrollIntoView({behavior:window.matchMedia("(prefers-reduced-motion: reduce)").matches?"instant":"smooth",block:"start"});let r=X_().then(a=>({data:a}),a=>({error:a}));try{let a=_c(await $n(Ie(e.manifest_url),n.signal),i);if(s!==ys)return;Fd(a,vs);for(let l of["part_count","unique_types","color_count","layer_count","height_mm","width_mm","depth_mm"])if(e.metrics[l]!==a.metrics[l])throw new Se(`\u30AB\u30BF\u30ED\u30B0\u3068\u914D\u7F6E\u30C7\u30FC\u30BF\u306E ${l} \u304C\u4E00\u81F4\u3057\u307E\u305B\u3093\u3002\u518D\u751F\u6210\u307E\u305F\u306F\u518D\u8AAD\u307F\u8FBC\u307F\u304C\u5FC5\u8981\u3067\u3059\u3002`);ve=a,Ce=vc(ve),me={explosion:0,layers:Ce.layers.length,steps:Ce.steps.length},Ic(ve,e,vs),dr.load(ve,Ce,me),Bi(!0,!1),A("#explode").disabled=!0,br(me,Ce,ve.parts.length,ve.parts.length);let o=await r;if(s!==ys)return;if(o.error)throw new Se(`\u5B9F\u90E8\u54C1\u306E\u5F62\u72B6\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3002${o.error.message} \u7BB1\u3084\u5186\u67F1\u306B\u3088\u308B\u4EE3\u66FF\u306F\u8868\u793A\u3057\u307E\u305B\u3093\u3002`);try{W_().load(ve,o.data,Ce)}catch(l){if(l instanceof Se)throw l;console.error("3D model initialization failed",l);let c=l instanceof Error?l.message:String(l);throw new Se(`3D\u3092\u521D\u671F\u5316\u3067\u304D\u307E\u305B\u3093\u3002WebGL\u5BFE\u5FDC\u306E\u30D6\u30E9\u30A6\u30B6\u30FC\u3068\u30CF\u30FC\u30C9\u30A6\u30A7\u30A2\u30A2\u30AF\u30BB\u30E9\u30EC\u30FC\u30B7\u30E7\u30F3\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u90E8\u54C1\u4E00\u89A7\u30FB\u69CB\u6210\u8868\u306F\u5229\u7528\u3067\u304D\u307E\u3059\u3002\u8A73\u7D30: ${c}`)}Xn=!0,A("#stage-message").hidden=!0,A("#height-callout").hidden=!1,Bi(!0,!0),br(me,Ce,ve.parts.length,ve.parts.length),fi(`${hn[e.character].name}\u3001${Pn[e.style].name}\u3002${ve.parts.length}\u500B\u306E\u30D6\u30EA\u30C3\u30AF\u3092\u8868\u793A\u3002\u9032\u884C\u3092\u5B8C\u6210\u5F62\u306B\u623B\u3057\u307E\u3057\u305F\u3002`)}catch(a){if(s!==ys||n.signal.aborted)return;Xn=!1;let o=ve?"\u5B9F\u90E8\u54C1\u306E3D\u3092\u8868\u793A\u3067\u304D\u307E\u305B\u3093":"\u3053\u306E\u6848\u306E\u914D\u7F6E\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093";Oi(o,a.message||"\u30C7\u30FC\u30BF\u306E\u751F\u6210\u72B6\u6CC1\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002",!0),Bi(!!ve,!1),A("#explode").disabled=!0,fi(`${o}\u3002${a.message}`)}finally{s===ys&&A("#viewport").setAttribute("aria-busy","false")}}function Ms(){if(!ve||!Ce)return;let i=Xn?Ze.setProgress(me):ve.parts.filter(t=>bn(t,Ce,me.layers,me.steps)).length;br(me,Ce,i,ve.parts.length),dr.setProgress(me),Xn||(A("#focus-part").disabled=!0)}function sc(i){let t=i?Ce?.partsById.get(i):null;if(!(i&&!t))if(Ze?.select(t??null),dr.renderSelected(t?.id??null),Xn||(A("#focus-part").disabled=!0),t){let e=bn(t,Ce,me.layers,me.steps);fi(`\u90E8\u54C1 ${t.id} \u3092\u9078\u629E\u3002${ve.palette[t.color_id].name}\u3001${t.type_id}\u3001\u7B2C${t.layer+1}\u5C64\u3001\u9806\u5E8F\u5019\u88DC${t.step}\u3002${t.insertion_axis==="+Z"?"\u4E0B\u5074\u304B\u3089\u306E\u5F8C\u4ED8\u3051\u5019\u88DC\u3002\u5DEE\u8FBC\u7D4C\u8DEF\u306F\u672A\u691C\u8A3C\u3002":""}${e?"":"\u73FE\u5728\u306E\u9032\u884C\u7BC4\u56F2\u5916\u3067\u3059\u3002"}`)}else fi("\u90E8\u54C1\u306E\u9078\u629E\u3092\u89E3\u9664\u3057\u307E\u3057\u305F\u3002")}async function rc(i){let t=typeof i=="string"?i:bs?.id;wo?.abort(),wo=new AbortController;let e=wo;hr?.abort(),ys+=1,Xn=!1,Ze?.clear(),Ye=null,bs=null,ve=null,Ce=null,So=null,xs=null,vs=null,To.setScope(null,null,"\u8868\u793A\u3059\u308B\u9078\u629E\u7248\u30FB\u5C65\u6B74\u3092\u78BA\u8A8D\u4E2D\u3067\u3059\u3002"),Vd(),Fo(),dr.clear(),A("#catalog-error").hidden=!0,A("#revision-title").textContent=Eo==="phase1"?"Phase1\u306E\u6BD4\u8F03\u5C65\u6B74\u3092\u78BA\u8A8D\u4E2D":kd?"\u660E\u793A\u3055\u308C\u305F\u7248\u3092\u78BA\u8A8D\u4E2D\uFF08\u7248\u6307\u5B9A\u30D7\u30EC\u30D3\u30E5\u30FC\uFF09":"\u9078\u629E\u8A18\u9332\u3068\u516C\u958B\u7248\u3092\u78BA\u8A8D\u4E2D",A("#revision-id").textContent="\u2014",A("#revision-detail").textContent="\u8868\u793A\u3059\u308B\u7248\u3092\u78BA\u8A8D\u3057\u3066\u3044\u307E\u3059\u3002\u5916\u89B3\u57FA\u6E96\u306E\u9078\u629E\u306F\u3001\u63A5\u5408\u90E8\u30FB\u7D44\u7ACB\u30FB\u88FD\u9020\u306E\u627F\u8A8D\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",A("#selection-summary").replaceChildren(),A("#trial-sets").replaceChildren(),A("#fit-trials").hidden=Eo==="phase1",A("#trial-summary").textContent="\u3053\u306E\u7248\u306E\u8A66\u9A13\u7247\u60C5\u5831\u3092\u78BA\u8A8D\u4E2D\u3067\u3059\u3002\u672C\u4F53\u4E00\u5F0F\u3092\u51FA\u529B\u3059\u308B\u6BB5\u968E\u3067\u306F\u3042\u308A\u307E\u305B\u3093\u3002",A("#downloads").replaceChildren(U("p","section-empty","\u8868\u793A\u3059\u308B\u7248\u306E\u53D6\u5F97\u5148\u3092\u78BA\u8A8D\u4E2D\u3067\u3059\u3002")),A("#video-preview video")?.pause(),A("#video-preview").replaceChildren(),A("#gallery").replaceChildren(U("p","section-empty","\u6BD4\u8F03\u30AB\u30BF\u30ED\u30B0\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D\u3067\u3059\u3002")),Oi("\u5F62\u72B6\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u307F\u4E2D","\u516C\u958B\u30A2\u30FC\u30AB\u30A4\u30D6\u306E\u6BD4\u8F03\u30AB\u30BF\u30ED\u30B0\u3092\u78BA\u8A8D\u3057\u3066\u3044\u307E\u3059\u3002"),ge("button[data-character], button[data-style]").forEach(n=>{n.disabled=!0});try{let n=await Ud({mode:Eo,previewRevision:kd,readJSON:a=>$n(a,e.signal),readOptionalJSON:a=>$n(a,e.signal,{optional:!0})});if(e.signal.aborted)return;vs=n,Ye=n.catalog,ic(n),zd(n,e.signal),To.setScope(n.statusURL,n.kind==="baseline"?null:n.revision,"\u65B0\u7248\u306E\u516C\u958B\u30DD\u30A4\u30F3\u30BF\u30FC\u304C\u3042\u308A\u307E\u305B\u3093\u3002\u8868\u793A\u306FPhase1\u306E\u9078\u629E\u6E08\u307F\u57FA\u6E96\u5F62\u72B6\u3067\u3042\u308A\u3001\u65B0\u3057\u3044\u63A5\u5408\u90E8\u306E\u6700\u65B0\u6027\u30FB\u5B9F\u6A5F\u72B6\u614B\u306F\u672A\u78BA\u8A8D\u3067\u3059\u3002"),Ac(Ye,Ao,n);let s=new URLSearchParams(window.location.search).get("candidate"),r=Ye.candidates.find(a=>a.id===t)??Ye.candidates.find(a=>a.id===s)??(n.kind==="phase1"?Ye.candidates.find(a=>a.character==="mona"&&a.style==="balanced"):null)??Ye.candidates[0];await Ao(r.id)}catch(n){if(e.signal.aborted)return;To.setScope(null,null,`\u8868\u793A\u5BFE\u8C61\u306E\u7248\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093\u3002\u30C7\u30FC\u30BF\u304C\u6700\u65B0\u3067\u3042\u308B\u3068\u306F\u5224\u65AD\u3067\u304D\u307E\u305B\u3093\u3002${n.message}`),Tc(`\u9078\u629E\u8A18\u9332\u307E\u305F\u306F\u30AB\u30BF\u30ED\u30B0\u3092\u8AAD\u307F\u8FBC\u3081\u307E\u305B\u3093\u3002${n.message}`,rc),Oi("\u751F\u6210\u6E08\u307F\u30C7\u30FC\u30BF\u304C\u5FC5\u8981\u3067\u3059","\u9078\u629E\u8A18\u9332\u30FB\u516C\u958B\u30AB\u30BF\u30ED\u30B0\u30FB\u5B9F\u969B\u306E\u90E8\u54C1\u5F62\u72B6\u3092\u78BA\u8A8D\u3057\u3066\u304F\u3060\u3055\u3044\u3002\u904E\u53BB\u306E\u30C7\u30FC\u30BF\u3092\u65B0\u7248\u3068\u3057\u3066\u8868\u793A\u305B\u305A\u3001\u30C0\u30DF\u30FC\u30E2\u30C7\u30EB\u306F\u8868\u793A\u3057\u307E\u305B\u3093\u3002",!0),A("#candidate-title").textContent="\u30E2\u30C7\u30EB\u672A\u8AAD\u8FBC",A("#candidate-kicker").textContent="ARCHIVE DATA UNAVAILABLE",A("#candidate-id").textContent="\u2014",A("#gallery").replaceChildren(U("p","section-empty","\u6BD4\u8F03\u30C7\u30FC\u30BF\u3092\u8AAD\u307F\u8FBC\u3081\u306A\u3044\u305F\u3081\u3001\u5916\u89B3\u3084\u90E8\u54C1\u6570\u306F\u8868\u793A\u3057\u3066\u3044\u307E\u305B\u3093\u3002")),A("#downloads").replaceChildren(U("p","section-empty","\u751F\u6210\u6E08\u307F\u306E\u30AB\u30BF\u30ED\u30B0\u3092\u78BA\u8A8D\u5F8C\u3001\u5B9F\u5728\u3059\u308B\u30D5\u30A1\u30A4\u30EB\u306E\u307F\u53D6\u5F97\u3067\u304D\u307E\u3059\u3002")),A("#revision-title").textContent="\u8868\u793A\u5BFE\u8C61\u306E\u7248\u3092\u78BA\u8A8D\u3067\u304D\u307E\u305B\u3093",A("#revision-detail").textContent=n.message,A("#trial-summary").textContent="\u516C\u958B\u7248\u3092\u78BA\u8A8D\u3067\u304D\u306A\u3044\u305F\u3081\u3001\u904E\u53BB\u306E\u8A66\u9A13\u7247\u3092\u65B0\u7248\u3068\u3057\u3066\u8868\u793A\u3057\u307E\u305B\u3093\u3002",A("#contact-sheet-link").replaceChildren()}}ge("button[data-character]").forEach(i=>i.addEventListener("click",()=>{let t=Ye?.candidates.filter(n=>n.character===i.dataset.character)??[],e=t.find(n=>n.style===bs?.style)??t[0];e&&Ao(e.id)}));ge("button[data-style]").forEach(i=>i.addEventListener("click",()=>{let t=Ye?.candidates.find(e=>e.character===bs?.character&&e.style===i.dataset.style);t&&Ao(t.id)}));ge("[data-view]").forEach(i=>i.addEventListener("click",()=>Ze?.setView(i.dataset.view)));A("#reset-view").addEventListener("click",()=>Ze?.setView("perspective"));A("#explode").addEventListener("input",i=>{me.explosion=Number(i.target.value)/100,Ms()});A("#layers").addEventListener("input",i=>{me.layers=Number(i.target.value),Ms()});A("#steps").addEventListener("input",i=>{me.steps=Number(i.target.value),Ms()});A("#previous-step").addEventListener("click",()=>{me.steps=Math.max(0,me.steps-1),Ms()});A("#next-step").addEventListener("click",()=>{me.steps=Math.min(Ce.steps.length,me.steps+1),Ms()});A("#show-complete").addEventListener("click",()=>{me={explosion:0,layers:Ce.layers.length,steps:Ce.steps.length},Ms(),fi("\u5B8C\u6210\u5F62\u306E\u3059\u3079\u3066\u306E\u30D6\u30EA\u30C3\u30AF\u3092\u8868\u793A\u3057\u307E\u3057\u305F\u3002")});A("#clear-selection").addEventListener("click",()=>sc(null));A("#focus-part").addEventListener("click",()=>Ze?.focusPart());A("#retry-model").addEventListener("click",()=>{Ze&&!Xn&&(Ze.dispose(),Ze=null),rc(bs?.id)});window.addEventListener("pagehide",()=>{hr?.abort(),wo?.abort(),To.dispose(),Ze?.dispose()});window.addEventListener("pageshow",i=>{i.persisted&&window.location.reload()});rc();
/*! Bundled license information:

three/build/three.core.js:
three/build/three.module.js:
  (**
   * @license
   * Copyright 2010-2025 Three.js Authors
   * SPDX-License-Identifier: MIT
   *)
*/
