const fs = require('fs');
let code = fs.readFileSync('src/components/AdminLoginModal.tsx', 'utf8');

if (!code.includes('createPortal')) {
  code = code.replace("import React, { useState, useEffect, useRef } from 'react';", "import React, { useState, useEffect, useRef } from 'react';\nimport { createPortal } from 'react-dom';");
  
  code = code.replace("return (\n    <AnimatePresence>", "return createPortal(\n    <AnimatePresence>");
  
  code = code.replace("</AnimatePresence>\n  );", "</AnimatePresence>,\n    document.body\n  );");

  // Fix z-index
  code = code.replace("fixed inset-0 z-50", "fixed inset-0 z-[100]");

  fs.writeFileSync('src/components/AdminLoginModal.tsx', code);
  console.log("Successfully patched AdminLoginModal");
} else {
  console.log("Already patched");
}
