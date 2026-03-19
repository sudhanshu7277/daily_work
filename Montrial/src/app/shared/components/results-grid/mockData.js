getMockData() {
  return [
    {
      ocifId: "C2-001",
      profileName: "Corp 2",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      isParent: true,
      isExpanded: true,
      level: 0,
      children: [
        {
          ocifId: "RP-F",
          profileName: "Role Player F",
          legalHoldStatus: "N/A",
          holdName: "",
          lifecycle: "Active Customer",
          role: "Authorized Signature of ABC Ltd.",
          address: "33 Dundas St W, Toronto, ON M5G 2C3",
          isParent: false,
          level: 1
        },
        {
          ocifId: "RP-G",
          profileName: "Role Player G",
          legalHoldStatus: "N/A",
          holdName: "",
          lifecycle: "Active Customer",
          role: "Authorized Signature of ABC Ltd.",
          address: "33 Dundas St W, Toronto, ON M5G 2C3",
          isParent: true,
          isExpanded: true,
          level: 1,
          children: [
            {
              ocifId: "SUB-X",
              profileName: "Sub Role X",
              legalHoldStatus: "N/A",
              holdName: "",
              lifecycle: "Active Customer",
              role: "Owner",
              address: "33 Dundas St W, Toronto, ON M5G 2C3",
              isParent: true,
              isExpanded: true,
              level: 2,
              children: [
                {
                  ocifId: "DEEP-1",
                  profileName: "Deep Level 1",
                  legalHoldStatus: "LEGAL HOLD",
                  holdName: "Project Omega",
                  lifecycle: "Active Customer",
                  role: "Authorized Signature",
                  address: "33 Dundas St W, Toronto, ON M5G 2C3",
                  isParent: true,
                  isExpanded: true,
                  level: 3,
                  children: [
                    {
                      ocifId: "DEEP-2",
                      profileName: "Deep Level 2",
                      legalHoldStatus: "N/A",
                      holdName: "",
                      lifecycle: "Active Customer",
                      role: "Owner",
                      address: "33 Dundas St W, Toronto, ON M5G 2C3",
                      isParent: false,
                      level: 4
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    }
    // Add more top-level parents (Corp 3, Corp 4, etc.) the same way
  ];
}