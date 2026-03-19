getMockData() {
  return [
    {
      ocifId: "C2001",
      profileName: "Corp Alpha",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "Project Omega",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      isParent: true,
      isExpanded: true,
      children: [
        {
          ocifId: "RP-A1",
          profileName: "Role Player A1",
          legalHoldStatus: "N/A",
          holdName: "",
          lifecycle: "Active Customer",
          role: "Authorized Signatory",
          address: "33 Dundas St W, Toronto, ON M5G 2C3",
          isParent: true,
          isExpanded: true,
          children: [
            {
              ocifId: "SUB-X1",
              profileName: "Sub Entity X1",
              legalHoldStatus: "N/A",
              holdName: "",
              lifecycle: "Active Customer",
              role: "Owner",
              address: "33 Dundas St W, Toronto, ON M5G 2C3",
              isParent: false,
              isExpanded: false,
              children: []
            }
          ]
        }
      ]
    },
    {
      ocifId: "C2002",
      profileName: "Corp Beta",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      isParent: true,
      isExpanded: true,
      children: [
        {
          ocifId: "RP-B1",
          profileName: "Role Player B1",
          legalHoldStatus: "N/A",
          holdName: "",
          lifecycle: "Active Customer",
          role: "Authorized Signatory",
          address: "33 Dundas St W, Toronto, ON M5G 2C3",
          isParent: false,
          isExpanded: false,
          children: []
        }
      ]
    }
  ];
},
{
      ocifId: "C1001",
      profileName: "Corp A",
      legalHoldStatus: "N/A",
      holdName: "",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      isParent: false,
      isExpanded: false,
      children: []
    },
    {
      ocifId: "C1002",
      profileName: "Corp B",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "Project Omega",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      isParent: false,
      isExpanded: false,
      children: []
    },
    {
      ocifId: "C3001",
      profileName: "Corp Deep Root",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "Project Omega",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      isParent: true,
      isExpanded: true,
      children: [
        {
          ocifId: "L1-001",
          profileName: "Level 1 Entity",
          legalHoldStatus: "N/A",
          holdName: "",
          lifecycle: "Active Customer",
          role: "Authorized Signatory",
          address: "33 Dundas St W, Toronto, ON M5G 2C3",
          isParent: true,
          isExpanded: true,
          children: [
            {
              ocifId: "L2-001",
              profileName: "Level 2 Sub",
              legalHoldStatus: "N/A",
              holdName: "",
              lifecycle: "Active Customer",
              role: "Owner",
              address: "33 Dundas St W, Toronto, ON M5G 2C3",
              isParent: true,
              isExpanded: true,
              children: [
                {
                  ocifId: "L3-001",
                  profileName: "Level 3 Deep",
                  legalHoldStatus: "LEGAL HOLD",
                  holdName: "Project Alpha",
                  lifecycle: "Active Customer",
                  role: "Authorized Signatory",
                  address: "33 Dundas St W, Toronto, ON M5G 2C3",
                  isParent: true,
                  isExpanded: true,
                  children: [
                    {
                      ocifId: "L4-001",
                      profileName: "Level 4 Sub",
                      legalHoldStatus: "N/A",
                      holdName: "",
                      lifecycle: "Active Customer",
                      role: "Owner",
                      address: "33 Dundas St W, Toronto, ON M5G 2C3",
                      isParent: true,
                      isExpanded: true,
                      children: [
                        {
                          ocifId: "L5-001",
                          profileName: "Level 5 Deepest",
                          legalHoldStatus: "N/A",
                          holdName: "",
                          lifecycle: "Active Customer",
                          role: "Authorized Signatory",
                          address: "33 Dundas St W, Toronto, ON M5G 2C3",
                          isParent: false,
                          isExpanded: false,
                          children: []
                        }
                      ]
                    }
                  ]
                }
              ]
            }
          ]
        }
      ]
    },
    {
      ocifId: "C1002",
      profileName: "Corp B",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "Project Omega",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      isParent: false,
      isExpanded: false,
      children: []
    },
    {
      ocifId: "C1002",
      profileName: "Corp B",
      legalHoldStatus: "LEGAL HOLD",
      holdName: "Project Omega",
      lifecycle: "Active Customer",
      role: "Owner",
      address: "33 Dundas St W, Toronto, ON M5G 2C3",
      isParent: false,
      isExpanded: false,
      children: []
    }
  ];
},