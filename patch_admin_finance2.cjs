const fs = require('fs');
let code = fs.readFileSync('src/pages/admin/AdminFinance.tsx', 'utf8');

// The issue is around line 150-160
// The original file ended with:
//           </table>
//         </div>
//       </div>
//     </div>
//   );
// }

// Our previous script replaced:
//     </div>
//   </div>
// </div>
// );
// }

// Let's just fix the ending tags.
const regex = /<\/table>\s*{\/\* Direct UPI Payments Table \*\//;
code = code.replace(regex, `</table>\n        </div>\n      </div>\n\n      {/* Direct UPI Payments Table */}`);

fs.writeFileSync('src/pages/admin/AdminFinance.tsx', code);
console.log("Fixed AdminFinance closing tags");
