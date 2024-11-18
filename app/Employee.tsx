'use client'
import React, { useState, useEffect } from 'react'
import { useWriteContract, useWaitForTransactionReceipt, useReadContract } from 'wagmi'
import toast from 'react-hot-toast'

const Employee = () => {
    const CONTRACT_ADDRESS = '0xa8b4e56aaa645d6a6f1f757a85bbdcaa2245d4b5';
    const CONTRACT_ABI = [
        {
            "inputs": [
                {
                    "internalType": "string",
                    "name": "_name",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "_position",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "_salary",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "_walletAddress",
                    "type": "address"
                }
            ],
            "name": "addEmployee",
            "outputs": [],
            "stateMutability": "nonpayable",
            "type": "function"
        },
        {
            "inputs": [],
            "stateMutability": "nonpayable",
            "type": "constructor"
        },
        {
            "anonymous": false,
            "inputs": [
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "id",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "name",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "string",
                    "name": "position",
                    "type": "string"
                },
                {
                    "indexed": false,
                    "internalType": "uint256",
                    "name": "salary",
                    "type": "uint256"
                },
                {
                    "indexed": false,
                    "internalType": "address",
                    "name": "walletAddress",
                    "type": "address"
                }
            ],
            "name": "EmployeeAdded",
            "type": "event"
        },
        {
            "inputs": [
                {
                    "internalType": "uint256",
                    "name": "_id",
                    "type": "uint256"
                }
            ],
            "name": "getEmployee",
            "outputs": [
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "string",
                    "name": "",
                    "type": "string"
                },
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                },
                {
                    "internalType": "address",
                    "name": "",
                    "type": "address"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        },
        {
            "inputs": [],
            "name": "getTotalEmployees",
            "outputs": [
                {
                    "internalType": "uint256",
                    "name": "",
                    "type": "uint256"
                }
            ],
            "stateMutability": "view",
            "type": "function"
        }
    ]

    const [name, setName] = useState('');
    const [position, setPosition] = useState('');
    const [salary, setSalary] = useState('');
    const [walletAddress, setWalletAddress] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [currentEmployeeId, setCurrentEmployeeId] = useState(0);
    const [employees, setEmployees] = useState<{
        id: number;
        name: string;
        position: string;
        salary: string;
        walletAddress: string;
    }[]>([]);

    const { data: hash, error, isPending, writeContract } = useWriteContract();

    const { isLoading: isConfirming, isSuccess: isConfirmed } = useWaitForTransactionReceipt({
        hash,
    });

    const { data: employeeCount, isLoading: isLoadingCount } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getTotalEmployees',
    });

    const { data: employeeData, refetch: refetchEmployee } = useReadContract({
        address: CONTRACT_ADDRESS,
        abi: CONTRACT_ABI,
        functionName: 'getEmployee',
        args: [currentEmployeeId],
    });

    // Fetch all employees
    useEffect(() => {
        const fetchAllEmployees = async () => {
            if (!employeeCount) return;
            
            setIsLoading(true);
            try {
                const count = Number(employeeCount);
                const employeesList = [];
                
                for (let i = 0; i < count; i++) {
                    setCurrentEmployeeId(i);
                    await refetchEmployee();
                    
                    if (employeeData) {
                        const [name, position, salary, walletAddress] = employeeData as [string, string, bigint, string];
                        employeesList.push({
                            id: i,
                            name,
                            position,
                            salary: salary.toString(),
                            walletAddress
                        });
                    }
                }
                
                setEmployees(employeesList);
            } catch (error) {
                console.error('Error fetching employees:', error);
                toast.error('Failed to fetch employees');
            } finally {
                setIsLoading(false);
            }
        };

        fetchAllEmployees();
    }, [employeeCount, refetchEmployee, employeeData]);

    // Handle successful transaction
    useEffect(() => {
        if (isConfirmed) {
            toast.success('Employee added successfully!');
            // Clear form
            setName('');
            setPosition('');
            setSalary('');
            setWalletAddress('');
        }
    }, [isConfirmed]);

    const handleAddEmployee = async (e: React.FormEvent) => {
        e.preventDefault();
        
        try {
            if (!name || !position || !salary || !walletAddress) {
                toast.error('Please fill all fields');
                return;
            }

            // Validate wallet address
            if (!walletAddress.match(/^0x[a-fA-F0-9]{40}$/)) {
                toast.error('Invalid wallet address format');
                return;
            }

            // Convert salary to BigInt
            const salaryValue = BigInt(salary);

            await writeContract({
                address: CONTRACT_ADDRESS,
                abi: CONTRACT_ABI,
                functionName: 'addEmployee',
                args: [name, position, salaryValue, walletAddress],
            });
        } catch (error) {
            console.error('Transaction error:', error);
            toast.error('Transaction failed: ' + (error as Error).message);
        }
    }

    return (
        <div className="max-w-4xl mx-auto p-4">
            <h1 className="text-3xl font-bold mb-8">Employee Management System</h1>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Add Employee Form */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <h2 className="text-xl font-bold mb-4">Add New Employee</h2>
                    <form onSubmit={handleAddEmployee} className="space-y-4">
                        <div className="flex flex-col">
                            <label className="mb-1">Name:</label>
                            <input 
                                type="text" 
                                value={name} 
                                onChange={(e) => setName(e.target.value)}
                                className="border p-2 rounded"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1">Position:</label>
                            <input 
                                type="text" 
                                value={position} 
                                onChange={(e) => setPosition(e.target.value)}
                                className="border p-2 rounded"
                                required
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1">Salary (in Wei):</label>
                            <input 
                                type="number" 
                                value={salary} 
                                onChange={(e) => setSalary(e.target.value)}
                                className="border p-2 rounded"
                                required
                                min="0"
                            />
                        </div>

                        <div className="flex flex-col">
                            <label className="mb-1">Wallet Address:</label>
                            <input 
                                type="text" 
                                value={walletAddress} 
                                onChange={(e) => setWalletAddress(e.target.value)}
                                className="border p-2 rounded"
                                required
                                pattern="^0x[a-fA-F0-9]{40}$"
                                placeholder="0x..."
                            />
                        </div>

                        <button 
                            type="submit" 
                            disabled={isPending || isConfirming}
                            className={`w-full p-2 rounded text-white ${
                                isPending || isConfirming 
                                    ? 'bg-gray-400' 
                                    : 'bg-blue-500 hover:bg-blue-600'
                            }`}
                        >
                            {isPending || isConfirming ? 'Processing...' : 'Add Employee'}
                        </button>
                    </form>

                    {error && (
                        <div className="mt-4 p-2 bg-red-100 text-red-700 rounded">
                            {error.message}
                        </div>
                    )}
                </div>

                {/* Employee List */}
                <div className="bg-white p-6 rounded-lg shadow">
                    <div className="flex justify-between items-center mb-4">
                        <h2 className="text-xl font-bold">Employee List</h2>
                        <span className="text-sm text-gray-600">
                            Total: {isLoadingCount ? 'Loading...' : employeeCount?.toString() ?? '0'}
                        </span>
                    </div>

                    {isLoading ? (
                        <div className="text-center py-4">Loading employees...</div>
                    ) : employees.length === 0 ? (
                        <div className="text-center py-4 text-gray-500">No employees found</div>
                    ) : (
                        <div className="space-y-4 max-h-[600px] overflow-y-auto">
                            {employees.map((employee) => (
                                <div 
                                    key={employee.id}
                                    className="border p-4 rounded-lg shadow-sm hover:shadow-md transition-shadow"
                                >
                                    <div className="flex justify-between items-start">
                                        <div>
                                            <h3 className="font-bold text-lg">{employee.name}</h3>
                                            <p className="text-gray-600">{employee.position}</p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Salary: {employee.salary} Wei
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-400">ID: {employee.id}</span>
                                    </div>
                                    <p className="text-xs text-gray-500 mt-2 truncate">
                                        Wallet: {employee.walletAddress}
                                    </p>
                                </div>
                            ))}
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}

export default Employee