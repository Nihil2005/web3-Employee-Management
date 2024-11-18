// SPDX-License-Identifier: MIT
pragma solidity ^0.8.0;

contract EmployeeManagement {
    struct Employee {
        uint256 id;
        string name;
        string position;
        uint256 salary;
        address walletAddress;
    }

    uint256 private nextId;
    mapping(uint256 => Employee) private employees;

    event EmployeeAdded(uint256 id, string name, string position, uint256 salary, address walletAddress);

    constructor() {
        nextId = 1; // Initialize employee IDs starting at 1
    }

    // Add a new employee
    function addEmployee(
        string memory _name,
        string memory _position,
        uint256 _salary,
        address _walletAddress
    ) public {
        employees[nextId] = Employee(nextId, _name, _position, _salary, _walletAddress);
        emit EmployeeAdded(nextId, _name, _position, _salary, _walletAddress);
        nextId++;
    }

    // View employee details by ID
    function getEmployee(uint256 _id)
        public
        view
        returns (string memory, string memory, uint256, address)
    {
        require(_id > 0 && _id < nextId, "Employee does not exist.");
        Employee memory employee = employees[_id];
        return (employee.name, employee.position, employee.salary, employee.walletAddress);
    }

    // Get total number of employees
    function getTotalEmployees() public view returns (uint256) {
        return nextId - 1;
    }
}
