///  scss

/* --- Cleaned & Consolidated Date Picker Styles --- */

./* --- Consolidated Flat Date Picker Styles --- */

.date-input-wrapper {
    position: relative !important; /* Forces the relative context for the icon */
    display: block;
    width: 100%;
    box-sizing: border-box;
  }
  
  .custom-date-input {
    width: 100%;
    height: 40px;
    padding: 0 44px 0 12px;
    border: 1px solid #000000;
    border-radius: 4px;
    font-size: 14px;
    background-color: #ffffff;
    box-sizing: border-box;
    cursor: pointer;
  }
  
  /* Force native overlay capture click behavior */
  .custom-date-input::-webkit-calendar-picker-indicator {
    position: absolute;
    right: 0;
    top: 0;
    width: 100%;
    height: 100%;
    margin: 0;
    padding: 0;
    opacity: 0;
    cursor: pointer;
  }
  
  /* 🟢 FLATTENED: Pulled out of the nested layout rules to prevent component compilation loss */
  .custom-calendar-icon {
    position: absolute !important;
    right: 14px;
    top: 50%;
    transform: translateY(-50%);
    
    width: 18px;
    height: 18px;
    z-index: 10 !important; /* Bump z-index to stay clear on top of the input canvas */
    pointer-events: none;
    
    background-repeat: no-repeat;
    background-position: center;
    background-size: contain;
    background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='18' height='18' viewBox='0 0 24 24' fill='none' stroke='%23000' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Crect width='18' height='18' x='3' y='4' rx='2' ry='2'%3E%3C/rect%3E%3Cline x1='16' x2='16' y1='2' y2='6'%3E%3C/line%3E%3Cline x1='8' x2='8' y1='2' y2='6'%3E%3C/line%3E%3Cline x1='3' x2='21' y1='10' y2='10'%3E%3C/line%3E%3C/svg%3E");
  }
  // html

  <span class="custom-calendar-icon"></span>